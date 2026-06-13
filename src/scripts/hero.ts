import { reducedMotion } from './env';

/**
 * WebGL hero gating. The static SVG field has already painted underneath
 * (zero CLS); the OGL island is imported only AFTER first paint and only
 * when every gate passes. Gates: motion allowed, deviceMemory >= 4,
 * working WebGL context. On any failure the SVG simply remains the hero.
 */
export const initHeroGL = () => {
  if (reducedMotion()) return;

  const field = document.querySelector<HTMLElement>('[data-hero-field]');
  if (!field) return;

  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) return;

  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
  if (!gl) return;
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  const load = () => {
    import('./hero-gl')
      .then((m) => m.mount(field))
      .catch(() => {
        /* island failed to load — SVG fallback stays */
      });
  };
  const idle = () =>
    'requestIdleCallback' in window ? requestIdleCallback(load) : setTimeout(load, 250);

  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
};
