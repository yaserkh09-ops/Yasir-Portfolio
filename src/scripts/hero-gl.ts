import { Renderer, Geometry, Program, Mesh, Transform } from 'ogl';

/**
 * The hero field: ~20k ink/paper points on the brand grid, gently displaced
 * by 2D curl noise, repelled by the cursor (lerped, springy).
 *
 * Signal greens are a SEPARATE, small constellation (~14 points, CPU-
 * animated): they drift gently, and every 30–45s one shoots fast to a new
 * spot — the Rolls-Royce starlight "shooting star". Each green also feeds
 * a gravity well uniform that boils the nearby field points, so a shooting
 * star churns a path through the grid as it travels.
 *
 * Budgets and gates (gating itself lives in hero.ts):
 *  - DPR capped at 1.75
 *  - rAF paused when the tab is hidden or the canvas leaves the viewport
 *  - context disposed on navigation (pagehide)
 *  - colors strictly ink/paper + signal green, read from CSS tokens
 *  - on <768px viewports the field alpha is damped (uDamp) so hero text
 *    keeps its contrast; the greens stay full — they are the signal
 */

const GRID_GAP = 8; // css px between grid points
const MAX_POINTS = 40000;
const REPEL_RADIUS = 150;
const REPEL_PUSH = 34;

const GREEN_COUNT = 14; // the whole constellation (user spec: 10–20)
const SHOOT_MIN_S = 30; // seconds between shooting stars…
const SHOOT_MAX_S = 45;
const FIRST_SHOOT_S = 9; // …but show the first one early

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

const FIELD_VERTEX = /* glsl */ `
#define WELLS ${GREEN_COUNT}
attribute vec2 position;
attribute float aSeed;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uDpr;
uniform float uDamp;
uniform vec2 uWells[WELLS];
varying float vAlpha;
${NOISE}
void main() {
  vec2 pos = position;

  // 2D curl of a scalar simplex field — the field's resting breath
  float s = 1.0 / 170.0;
  float t = uTime * 0.07;
  float e = 6.0;
  float n  = snoise(vec3(pos * s, t + aSeed * 0.3));
  float nx = snoise(vec3((pos + vec2(e, 0.0)) * s, t + aSeed * 0.3));
  float ny = snoise(vec3((pos + vec2(0.0, e)) * s, t + aSeed * 0.3));
  vec2 curl = vec2(ny - n, -(nx - n)) / e;
  pos += curl * 15.0;

  // boil a little where the green stars sit (and churn where one shoots)
  vec2 boil = vec2(0.0);
  for (int i = 0; i < WELLS; i++) {
    vec2 dw = pos - uWells[i];
    float dist = length(dw);
    float infl = smoothstep(130.0, 0.0, dist);
    float ph = uTime * 2.0 + float(i) * 1.7 + aSeed * 6.2831;
    boil += (dw / max(dist, 1.0)) * infl * sin(ph) * 4.0;
  }
  pos += boil;

  // springy cursor repulsion (the hover animation)
  vec2 d = pos - uMouse;
  float dist = max(length(d), 0.001);
  float f = smoothstep(${REPEL_RADIUS}.0, 0.0, dist);
  pos += (d / dist) * f * uMouseStrength;

  vec2 clip = (pos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  gl_PointSize = (2.1 * (0.75 + aSeed * 0.5)) * uDpr;
  vAlpha = (0.48 + aSeed * 0.18 + f * 0.25) * uDamp;
}`;

const FIELD_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uPoint;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.25, d) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uPoint, alpha);
}`;

// the green constellation — positions/boost are CPU-animated per frame
const GREEN_VERTEX = /* glsl */ `
attribute vec2 position;
attribute float aSeed;
attribute float aBoost;
uniform vec2 uRes;
uniform float uDpr;
varying float vAlpha;
void main() {
  vec2 clip = (position / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = (3.2 + aSeed * 0.8 + aBoost * 2.6) * uDpr;
  vAlpha = 0.9 + aBoost * 0.1;
}`;

const GREEN_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uAccent;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.22, d) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uAccent, alpha);
}`;

const cssColor = (name: string): [number, number, number] => {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['17', '17', '17'];
  probe.remove();
  return [Number(rgb[0]) / 255, Number(rgb[1]) / 255, Number(rgb[2]) / 255];
};

const buildFieldGeometry = (gl: WebGLRenderingContext, w: number, h: number) => {
  let gap = GRID_GAP;
  const estimate = (g: number) => Math.ceil(w / g) * Math.ceil(h / g);
  while (estimate(gap) > MAX_POINTS) gap += 1;

  const total = estimate(gap);
  const pts = new Float32Array(total * 2);
  const seeds = new Float32Array(total);
  let n = 0;
  for (let x = gap / 2; x < w; x += gap)
    for (let y = gap / 2; y < h && n < total; y += gap) {
      pts[n * 2] = x;
      pts[n * 2 + 1] = y;
      seeds[n] = Math.random();
      n += 1;
    }

  return new Geometry(gl, {
    position: { size: 2, data: n === total ? pts : pts.subarray(0, n * 2) },
    aSeed: { size: 1, data: n === total ? seeds : seeds.subarray(0, n) },
  });
};

interface Star {
  x: number;
  y: number;
  home: [number, number];
  phase: number;
  // shooting-star flight state
  from: [number, number] | null;
  to: [number, number] | null;
  start: number;
  duration: number;
  arc: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

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

  const fieldProgram = new Program(gl, {
    vertex: FIELD_VERTEX,
    fragment: FIELD_FRAGMENT,
    transparent: true,
    depthTest: false,
    uniforms: {
      uRes: { value: [1, 1] },
      uTime: { value: 0 },
      uMouse: { value: [-9999, -9999] },
      uMouseStrength: { value: 0 },
      uDpr: { value: Math.min(devicePixelRatio || 1, 1.75) },
      uDamp: { value: 1 },
      // plain array (not Float32Array) — OGL only uploads array uniforms
      // whose value passes Array.isArray()
      uWells: { value: new Array(GREEN_COUNT * 2).fill(-9999) as number[] },
      uPoint: { value: cssColor('--gl-point') },
    },
  });

  const greenProgram = new Program(gl, {
    vertex: GREEN_VERTEX,
    fragment: GREEN_FRAGMENT,
    transparent: true,
    depthTest: false,
    uniforms: {
      uRes: { value: [1, 1] },
      uDpr: { value: Math.min(devicePixelRatio || 1, 1.75) },
      uAccent: { value: cssColor('--gl-accent') },
    },
  });

  // green constellation state + streaming buffers
  const stars: Star[] = [];
  const greenPos = new Float32Array(GREEN_COUNT * 2);
  const greenSeed = new Float32Array(GREEN_COUNT);
  const greenBoost = new Float32Array(GREEN_COUNT);
  for (let i = 0; i < GREEN_COUNT; i += 1) greenSeed[i] = Math.random();
  const greenGeometry = new Geometry(gl, {
    position: { size: 2, data: greenPos, usage: gl.DYNAMIC_DRAW },
    aSeed: { size: 1, data: greenSeed },
    aBoost: { size: 1, data: greenBoost, usage: gl.DYNAMIC_DRAW },
  });

  const scene = new Transform();
  let fieldMesh: Mesh | null = null;
  const greenMesh = new Mesh(gl, { mode: gl.POINTS, geometry: greenGeometry, program: greenProgram });
  greenMesh.setParent(scene);

  const wells = fieldProgram.uniforms.uWells.value as number[];
  let W = 1;
  let H = 1;

  const randomSpot = (): [number, number] => [
    W * (0.06 + Math.random() * 0.88),
    H * (0.06 + Math.random() * 0.88),
  ];

  const seedStars = () => {
    stars.length = 0;
    for (let i = 0; i < GREEN_COUNT; i += 1) {
      const home = randomSpot();
      stars.push({
        x: home[0],
        y: home[1],
        home,
        phase: Math.random() * Math.PI * 2,
        from: null,
        to: null,
        start: 0,
        duration: 0,
        arc: 0,
      });
    }
  };

  const rebuild = () => {
    const w = field.clientWidth;
    const h = field.clientHeight;
    if (w === 0 || h === 0) return;
    W = w;
    H = h;
    renderer.setSize(w, h);
    fieldProgram.uniforms.uRes.value = [w, h];
    greenProgram.uniforms.uRes.value = [w, h];
    // field text keeps its contrast on small screens: damp the field only
    fieldProgram.uniforms.uDamp.value = w < 768 ? 0.55 : 1;
    if (fieldMesh) fieldMesh.setParent(null);
    fieldMesh = new Mesh(gl, { mode: gl.POINTS, geometry: buildFieldGeometry(gl, w, h), program: fieldProgram });
    fieldMesh.setParent(scene);
    seedStars();
  };
  rebuild();

  // shooting-star scheduler — driven by frame time so it pauses offscreen
  let nextShoot = FIRST_SHOOT_S;
  const launchStar = (now: number) => {
    const idle = stars.filter((s) => !s.to);
    const star = idle[Math.floor(Math.random() * idle.length)];
    if (!star) return;
    let target = randomSpot();
    // insist on a real journey (>= 35% of the smaller canvas side)
    for (let tries = 0; tries < 8; tries += 1) {
      if (Math.hypot(target[0] - star.x, target[1] - star.y) >= Math.min(W, H) * 0.35) break;
      target = randomSpot();
    }
    star.from = [star.x, star.y];
    star.to = target;
    star.start = now;
    star.duration = 0.8 + Math.random() * 0.5; // fast — a meteor, not a drift
    star.arc = (30 + Math.random() * 40) * (Math.random() < 0.5 ? -1 : 1);
  };

  const updateStars = (now: number) => {
    if (now >= nextShoot) {
      launchStar(now);
      nextShoot = now + SHOOT_MIN_S + Math.random() * (SHOOT_MAX_S - SHOOT_MIN_S);
    }
    for (let i = 0; i < GREEN_COUNT; i += 1) {
      const s = stars[i]!;
      let boost = 0;
      if (s.to && s.from) {
        const t = Math.min(1, (now - s.start) / s.duration);
        const e = easeInOut(t);
        const dx = s.to[0] - s.from[0];
        const dy = s.to[1] - s.from[1];
        const len = Math.max(Math.hypot(dx, dy), 1);
        // slight perpendicular arc, like a headliner shooting star
        const bow = Math.sin(t * Math.PI) * s.arc;
        s.x = s.from[0] + dx * e + (-dy / len) * bow;
        s.y = s.from[1] + dy * e + (dx / len) * bow;
        boost = Math.sin(t * Math.PI);
        if (t >= 1) {
          s.home = [s.to[0], s.to[1]];
          s.from = null;
          s.to = null;
        }
      } else {
        // idle: gentle starlight drift around home
        s.x = s.home[0] + Math.sin(now * 0.3 + s.phase) * 9;
        s.y = s.home[1] + Math.cos(now * 0.23 + s.phase * 1.7) * 7;
      }
      greenPos[i * 2] = s.x;
      greenPos[i * 2 + 1] = s.y;
      greenBoost[i] = boost;
      wells[i * 2] = s.x;
      wells[i * 2 + 1] = s.y;
    }
    greenGeometry.attributes.position!.needsUpdate = true;
    greenGeometry.attributes.aBoost!.needsUpdate = true;
  };

  // theme switches retint the field via the CSS tokens
  const themeWatch = new MutationObserver(() => {
    fieldProgram.uniforms.uPoint.value = cssColor('--gl-point');
    greenProgram.uniforms.uAccent.value = cssColor('--gl-accent');
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
    const now = t / 1000;
    fieldProgram.uniforms.uTime.value = now;
    updateStars(now);
    mouse.x += (mouse.tx - mouse.x) * 0.14;
    mouse.y += (mouse.ty - mouse.y) * 0.14;
    const moving = Math.hypot(mouse.tx - mouse.x, mouse.ty - mouse.y);
    const target = Math.min(1, moving / 18) * REPEL_PUSH + REPEL_PUSH * 0.35;
    mouse.strength += (target - mouse.strength) * 0.08;
    fieldProgram.uniforms.uMouse.value = [mouse.x, mouse.y];
    fieldProgram.uniforms.uMouseStrength.value = mouse.strength;
    renderer.render({ scene });
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
