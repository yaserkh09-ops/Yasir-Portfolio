import { Renderer, Geometry, Program, Mesh } from 'ogl';

/**
 * The hero field: ~20k points on the brand grid, gently displaced by 2D
 * curl noise. Cursor proximity repels (lerped, springy). The ~4% signal
 * green points carry a subtle centred-gravity motion and act as gravity
 * wells that "boil" the nearby ink/paper points a little. (The flowing
 * band motif now lives in the footer field — see footer-gl.ts.)
 *
 * Budgets and gates (gating itself lives in hero.ts):
 *  - DPR capped at 1.75
 *  - rAF paused when the tab is hidden or the canvas leaves the viewport
 *  - context disposed on navigation (pagehide)
 *  - colors strictly ink/paper + ~4% signal green, read from CSS tokens
 */

const GRID_GAP = 8; // css px between grid points
const MAX_POINTS = 40000;
const GREEN_RATIO = 0.04;
const REPEL_RADIUS = 150;
const REPEL_PUSH = 34;
const WELLS = 10; // moving green gravity wells that boil the field

// Ashima 3D simplex noise; curl is taken in 2D via finite differences.
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}`;

const VERTEX = /* glsl */ `
#define WELLS ${WELLS}
attribute vec2 position;
attribute vec2 aData; // x: rand seed, y: isGreen
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uWells[WELLS];
varying float vGreen;
varying float vAlpha;
${NOISE}
void main() {
  vec2 pos = position;
  float seed = aData.x;
  float green = aData.y;

  // 2D curl of a scalar simplex field — the field's resting breath
  float s = 1.0 / 170.0;
  float t = uTime * 0.07;
  float e = 6.0;
  float n  = snoise(vec3(pos * s, t + seed * 0.3));
  float nx = snoise(vec3((pos + vec2(e, 0.0)) * s, t + seed * 0.3));
  float ny = snoise(vec3((pos + vec2(0.0, e)) * s, t + seed * 0.3));
  vec2 curl = vec2(ny - n, -(nx - n)) / e;
  pos += curl * 15.0;

  if (green > 0.5) {
    // green: subtle centred gravity — breathe toward centre + slow orbit
    vec2 toC = uCenter - pos;
    float dC = max(length(toC), 1.0);
    float breath = 0.5 + 0.5 * sin(uTime * 0.5 + seed * 6.2831);
    pos += (toC / dC) * 7.0 * breath;
    vec2 tang = vec2(-toC.y, toC.x) / dC;
    pos += tang * 5.0 * sin(uTime * 0.35 + seed * 6.2831);
  } else {
    // ink/paper: boil a little where the green gravity wells pass through
    vec2 boil = vec2(0.0);
    for (int i = 0; i < WELLS; i++) {
      vec2 dw = pos - uWells[i];
      float dist = length(dw);
      float infl = smoothstep(130.0, 0.0, dist);
      float ph = uTime * 2.0 + float(i) * 1.7 + seed * 6.2831;
      boil += (dw / max(dist, 1.0)) * infl * sin(ph) * 4.0;
    }
    pos += boil;
  }

  // springy cursor repulsion (the hover animation — kept)
  vec2 d = pos - uMouse;
  float dist = max(length(d), 0.001);
  float f = smoothstep(${REPEL_RADIUS}.0, 0.0, dist);
  pos += (d / dist) * f * uMouseStrength;

  vec2 clip = (pos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  // greens read as signals: larger and brighter than the field
  float size = (green > 0.5 ? 3.0 : 2.1) * (0.75 + seed * 0.5);
  gl_PointSize = size * uDpr;

  vGreen = green;
  vAlpha = (green > 0.5 ? 0.85 : 0.48) + seed * 0.18 + f * 0.25;
}`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uPoint;
uniform vec3 uAccent;
varying float vGreen;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.25, d) * vAlpha;
  if (alpha < 0.01) discard;
  vec3 color = mix(uPoint, uAccent, vGreen);
  gl_FragColor = vec4(color, alpha);
}`;

const cssColor = (name: string): [number, number, number] => {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['17', '17', '17'];
  probe.remove();
  return [Number(rgb[0]) / 255, Number(rgb[1]) / 255, Number(rgb[2]) / 255];
};

const buildGeometry = (gl: WebGLRenderingContext, w: number, h: number) => {
  let gap = GRID_GAP;
  const estimate = (g: number) => Math.ceil(w / g) * Math.ceil(h / g);
  while (estimate(gap) > MAX_POINTS) gap += 1;

  // preallocated typed arrays — keeps the (idle-time) build off long-task lists
  const total = estimate(gap);
  const pts = new Float32Array(total * 2);
  const data = new Float32Array(total * 2);
  let n = 0;

  const push = (x: number, y: number) => {
    pts[n * 2] = x;
    pts[n * 2 + 1] = y;
    data[n * 2] = Math.random();
    data[n * 2 + 1] = Math.random() < GREEN_RATIO ? 1 : 0;
    n += 1;
  };

  // the brand grid
  for (let x = gap / 2; x < w; x += gap)
    for (let y = gap / 2; y < h && n < total; y += gap) push(x, y);

  return new Geometry(gl, {
    position: { size: 2, data: n === total ? pts : pts.subarray(0, n * 2) },
    aData: { size: 2, data: n === total ? data : data.subarray(0, n * 2) },
  });
};

export const mount = (field: HTMLElement) => {
  const renderer = new Renderer({
    dpr: Math.min(devicePixelRatio || 1, 1.75),
    alpha: true,
    depth: false,
    antialias: false,
  });
  const gl = renderer.gl;
  const canvas = gl.canvas as HTMLCanvasElement;
  field.append(canvas);

  const program = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    transparent: true,
    depthTest: false,
    uniforms: {
      uRes: { value: [1, 1] },
      uTime: { value: 0 },
      uMouse: { value: [-9999, -9999] },
      uMouseStrength: { value: 0 },
      uDpr: { value: Math.min(devicePixelRatio || 1, 1.75) },
      uCenter: { value: [1, 1] },
      // plain array (not Float32Array) — OGL only uploads array uniforms
      // whose value passes Array.isArray()
      uWells: { value: new Array(WELLS * 2).fill(0) as number[] },
      uPoint: { value: cssColor('--gl-point') },
      uAccent: { value: cssColor('--gl-accent') },
    },
  });

  // centred-gravity wells, animated on the CPU and uploaded each frame
  const wells = program.uniforms.uWells.value as number[];
  let cx = 0;
  let cy = 0;
  let minDim = 1;

  let mesh: Mesh | null = null;
  const rebuild = () => {
    const w = field.clientWidth;
    const h = field.clientHeight;
    renderer.setSize(w, h);
    program.uniforms.uRes.value = [w, h];
    cx = w / 2;
    cy = h / 2;
    minDim = Math.min(w, h);
    program.uniforms.uCenter.value = [cx, cy];
    mesh = new Mesh(gl, { mode: gl.POINTS, geometry: buildGeometry(gl, w, h), program });
  };
  rebuild();

  // theme switches retint the field via the CSS tokens
  const themeWatch = new MutationObserver(() => {
    program.uniforms.uPoint.value = cssColor('--gl-point');
    program.uniforms.uAccent.value = cssColor('--gl-accent');
  });
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuild, 200);
  };
  addEventListener('resize', onResize, { passive: true });

  // lerped, springy cursor state
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0 };
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = e.clientX - r.left;
    mouse.ty = e.clientY - r.top;
  };
  addEventListener('pointermove', onPointer, { passive: true });

  let raf = 0;
  let running = false;
  let started = false;
  const frame = (t: number) => {
    if (!running) return;
    const tt = t / 1000;
    program.uniforms.uTime.value = tt;

    // wells drift slowly around the centre — the "centred gravity"
    for (let i = 0; i < WELLS; i += 1) {
      const ang = tt * 0.15 + (i * (Math.PI * 2)) / WELLS;
      const rad = minDim * (0.1 + 0.05 * Math.sin(tt * 0.3 + i));
      wells[i * 2] = cx + Math.cos(ang) * rad;
      wells[i * 2 + 1] = cy + Math.sin(ang) * rad * 0.55;
    }

    mouse.x += (mouse.tx - mouse.x) * 0.14;
    mouse.y += (mouse.ty - mouse.y) * 0.14;
    const moving = Math.hypot(mouse.tx - mouse.x, mouse.ty - mouse.y);
    const target = Math.min(1, moving / 18) * REPEL_PUSH + REPEL_PUSH * 0.35;
    mouse.strength += (target - mouse.strength) * 0.08;
    program.uniforms.uMouse.value = [mouse.x, mouse.y];
    program.uniforms.uMouseStrength.value = mouse.strength;
    if (mesh) renderer.render({ scene: mesh });
    if (!started) {
      started = true;
      canvas.classList.add('is-on'); // fade over the SVG only once warm
    }
    raf = requestAnimationFrame(frame);
  };

  let inView = true;
  const setRunning = () => {
    const next = inView && !document.hidden;
    if (next && !running) {
      running = true;
      raf = requestAnimationFrame(frame);
    } else if (!next) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  const io = new IntersectionObserver(([entry]) => {
    inView = !!entry?.isIntersecting;
    setRunning();
  });
  io.observe(field);
  document.addEventListener('visibilitychange', setRunning);
  setRunning();

  // dispose on navigation — never leak a GL context
  addEventListener(
    'pagehide',
    () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      themeWatch.disconnect();
      removeEventListener('pointermove', onPointer);
      removeEventListener('resize', onResize);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
    { once: true },
  );
};
