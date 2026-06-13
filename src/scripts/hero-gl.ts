import { Renderer, Geometry, Program, Mesh } from 'ogl';
import { dirSign } from './env';

/**
 * The hero field: ~20–34k points on the brand grid, displaced by 2D curl
 * noise, with a denser horizontal band flowing through — the Stroke motif
 * in 3D. Flow reverses on /ar/. Cursor proximity repels (lerped, springy).
 *
 * Budgets and gates (gating itself lives in hero.ts):
 *  - DPR capped at 1.75
 *  - rAF paused when the tab is hidden or the canvas leaves the viewport
 *  - context disposed on navigation (pagehide)
 *  - colors strictly ink/paper + ~4% signal green, read from CSS tokens
 */

const GRID_GAP = 8; // css px between grid points
const BAND_GAP = 6;
const BAND_ROWS = 12;
const MAX_POINTS = 40000;
const GREEN_RATIO = 0.04;
const REPEL_RADIUS = 150;
const REPEL_PUSH = 34;

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
attribute vec2 position;
attribute vec3 aData; // x: rand seed, y: isGreen, z: isBand
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uDir;
uniform float uDpr;
varying float vGreen;
varying float vAlpha;
${NOISE}
void main() {
  vec2 pos = position;

  // the band flows along the inline axis; wraps at the edges
  if (aData.z > 0.5) {
    pos.x = mod(pos.x + uTime * 42.0 * uDir, uRes.x + 40.0) - 20.0;
  }

  // 2D curl of a scalar simplex field (divergence-free drift)
  float s = 1.0 / 170.0;
  float t = uTime * 0.07;
  float e = 6.0;
  float n  = snoise(vec3(pos * s, t + aData.x * 0.3));
  float nx = snoise(vec3((pos + vec2(e, 0.0)) * s, t + aData.x * 0.3));
  float ny = snoise(vec3((pos + vec2(0.0, e)) * s, t + aData.x * 0.3));
  vec2 curl = vec2(ny - n, -(nx - n)) / e;
  pos += curl * (aData.z > 0.5 ? 26.0 : 15.0);

  // springy cursor repulsion
  vec2 d = pos - uMouse;
  float dist = max(length(d), 0.001);
  float f = smoothstep(${REPEL_RADIUS}.0, 0.0, dist);
  pos += (d / dist) * f * uMouseStrength;

  vec2 clip = (pos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  float size = (aData.z > 0.5 ? 2.3 : 1.6) * (0.75 + aData.x * 0.5);
  gl_PointSize = size * uDpr;

  vGreen = aData.y;
  vAlpha = (aData.z > 0.5 ? 0.55 : 0.3) + aData.x * 0.15 + f * 0.25;
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
  const estimate = (g: number) =>
    Math.ceil(w / g) * Math.ceil(h / g) + Math.ceil(w / BAND_GAP) * BAND_ROWS;
  while (estimate(gap) > MAX_POINTS) gap += 1;

  // preallocated typed arrays — keeps the (idle-time) build off long-task lists
  const total = estimate(gap);
  const pts = new Float32Array(total * 2);
  const data = new Float32Array(total * 3);
  let n = 0;

  const push = (x: number, y: number, band: number) => {
    pts[n * 2] = x;
    pts[n * 2 + 1] = y;
    data[n * 3] = Math.random();
    data[n * 3 + 1] = Math.random() < GREEN_RATIO ? 1 : 0;
    data[n * 3 + 2] = band;
    n += 1;
  };

  // the brand grid
  for (let x = gap / 2; x < w; x += gap)
    for (let y = gap / 2; y < h && n < total; y += gap) push(x, y, 0);

  // the Stroke band — denser rows around 58% height, gaussian-ish spread
  const bandY = h * 0.58;
  for (let r = 0; r < BAND_ROWS; r += 1) {
    const off = (r / (BAND_ROWS - 1) - 0.5) * 2; // -1..1
    const y = bandY + off * 34 * (1 - 0.4 * off * off);
    for (let x = Math.random() * BAND_GAP; x < w && n < total; x += BAND_GAP) push(x, y, 1);
  }

  return new Geometry(gl, {
    position: { size: 2, data: n === total ? pts : pts.subarray(0, n * 2) },
    aData: { size: 3, data: n === total ? data : data.subarray(0, n * 3) },
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
      uDir: { value: dirSign },
      uDpr: { value: Math.min(devicePixelRatio || 1, 1.75) },
      uPoint: { value: cssColor('--gl-point') },
      uAccent: { value: cssColor('--gl-accent') },
    },
  });

  let mesh: Mesh | null = null;
  const rebuild = () => {
    const w = field.clientWidth;
    const h = field.clientHeight;
    renderer.setSize(w, h);
    program.uniforms.uRes.value = [w, h];
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
    program.uniforms.uTime.value = t / 1000;
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
