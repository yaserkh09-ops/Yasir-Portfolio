import { reducedMotion } from './env';

/**
 * Footer WebGL gating — mirrors the hero gate. The static SVG band has
 * already painted (zero CLS); the OGL band island is imported only after
 * first paint and only when motion is allowed, deviceMemory >= 4, and a
 * hardware GL context exists. On any failure the SVG band simply stays.
 */
export const initFooterGL = () => {
  if (reducedMotion()) return;

  const field = document.querySelector<HTMLElement>('[data-footer-field]');
  if (!field) return;

  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) return;

  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
  if (!gl) return;
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  if (/swiftshader|llvmpipe|software/i.test(renderer)) return;

  const load = () => {
    import('./footer-gl')
      .then((m) => m.mount(field))
      .catch(() => {
        /* island failed to load — SVG band stays */
      });
  };
  const idle = () =>
    'requestIdleCallback' in window ? requestIdleCallback(load) : setTimeout(load, 250);

  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
};
