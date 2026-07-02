import { Renderer, Geometry, Program, Mesh } from 'ogl';
import { dirSign } from './env';

/**
 * Footer field: the flowing band of dots (the Stroke / kashida motif),
 * relocated here from the hero. A denser horizontal stream of ink/paper
 * points with ~4% signal green, flowing along the inline axis and
 * reversing on /ar/. Same budgets and lifecycle as the hero island:
 * DPR <= 1.75, rAF paused offscreen / tab-hidden, context disposed on
 * navigation, colors read from the CSS tokens.
 */

const COL_GAP = 6; // css px between points along the flow
const ROWS = 16;
const GREEN_RATIO = 0.04;
const MAX_POINTS = 14000;

const VERTEX = /* glsl */ `
attribute vec2 position;
attribute vec2 aData; // x: rand seed, y: isGreen
uniform vec2 uRes;
uniform float uTime;
uniform float uDir;
uniform float uDpr;
varying float vGreen;
varying float vAlpha;
void main() {
  vec2 pos = position;
  // horizontal flow with edge wrap. The wrap domain (uRes.x + 40) MUST
  // equal the spawn domain in buildGeometry — a mismatch circulates an
  // empty window through the band (the visible "split").
  pos.x = mod(pos.x + uTime * 34.0 * uDir, uRes.x + 40.0) - 20.0;
  // gentle vertical wobble so the band breathes
  pos.y += sin(pos.x * 0.012 + uTime * 0.9 + aData.x * 6.2831) * 4.0;

  vec2 clip = (pos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = ((aData.y > 0.5 ? 2.8 : 2.2) * (0.7 + aData.x * 0.5)) * uDpr;

  vGreen = aData.y;
  vAlpha = (aData.y > 0.5 ? 0.85 : 0.58) + aData.x * 0.22;
}`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uPoint;
uniform vec3 uAccent;
varying float vGreen;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.25, d) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uPoint, uAccent, vGreen), a);
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
  // spawn across the FULL wrap domain (canvas width + 40px margin) so the
  // shader's mod() wrap is seamless — see the note in the vertex shader
  const cols = Math.max(1, Math.ceil((w + 40) / COL_GAP));
  let rows = ROWS;
  while (cols * rows > MAX_POINTS && rows > 1) rows -= 1;

  const total = cols * rows;
  const pts = new Float32Array(total * 2);
  const data = new Float32Array(total * 2);
  let n = 0;

  const cy = h * 0.34; // upper third — keeps the credit row below it clear
  for (let r = 0; r < rows; r += 1) {
    const off = rows > 1 ? (r / (rows - 1) - 0.5) * 2 : 0; // -1..1
    const y = cy + off * (h * 0.22) * (1 - 0.3 * off * off); // gaussian-ish band
    for (let c = 0; c < cols && n < total; c += 1) {
      pts[n * 2] = c * COL_GAP + Math.random() * COL_GAP;
      pts[n * 2 + 1] = y;
      data[n * 2] = Math.random();
      data[n * 2 + 1] = Math.random() < GREEN_RATIO ? 1 : 0;
      n += 1;
    }
  }

  return new Geometry(gl, {
    position: { size: 2, data: pts.subarray(0, n * 2) },
    aData: { size: 2, data: data.subarray(0, n * 2) },
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
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    program.uniforms.uRes.value = [w, h];
    mesh = new Mesh(gl, { mode: gl.POINTS, geometry: buildGeometry(gl, w, h), program });
  };
  rebuild();

  // theme switches retint the band via the CSS tokens
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

  let raf = 0;
  let running = false;
  let started = false;
  const frame = (t: number) => {
    if (!running) return;
    program.uniforms.uTime.value = t / 1000;
    if (mesh) renderer.render({ scene: mesh });
    if (!started) {
      started = true;
      canvas.classList.add('is-on'); // fade over the static SVG once warm
    }
    raf = requestAnimationFrame(frame);
  };

  let inView = false;
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

  // footer is below the fold — only spins up once scrolled into view
  const io = new IntersectionObserver(([entry]) => {
    inView = !!entry?.isIntersecting;
    if (inView && mesh === null) rebuild();
    setRunning();
  });
  io.observe(field);
  document.addEventListener('visibilitychange', setRunning);
  setRunning();

  addEventListener(
    'pagehide',
    () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      themeWatch.disconnect();
      removeEventListener('resize', onResize);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
    { once: true },
  );
};
