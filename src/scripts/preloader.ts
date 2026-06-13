import { EASE_CSS } from './env';

const CAP_MS = 1200; // hard cap — finish faster if assets do

/**
 * Counter 000→100 synced to real loading (fonts + window load), a single
 * Stroke drawing beneath it, then the layer wipes up. Resolves when the
 * wipe completes so the hero reveal can chain. The element only exists
 * visibly when html[data-preload="show"] (first visit, motion allowed) —
 * decided pre-paint in Base.astro.
 */
export const runPreloader = (): Promise<void> => {
  try {
    sessionStorage.setItem('yasir:visited', '1');
  } catch {
    /* session flag is best-effort */
  }

  const root = document.querySelector<HTMLElement>('[data-preloader]');
  const skipped = document.documentElement.dataset.preload !== 'show';
  if (!root || skipped) {
    root?.remove();
    return Promise.resolve();
  }

  // cancel the CSS js-failure bail — JS owns the exit now
  root.style.animation = 'none';

  const count = root.querySelector<HTMLElement>('[data-preloader-count]')!;
  const stroke = root.querySelector<HTMLElement>('[data-preloader-stroke]')!;

  let loaded = document.readyState === 'complete' ? 1 : 0;
  window.addEventListener('load', () => (loaded = 1), { once: true });
  document.fonts?.ready.then(() => {
    loaded = Math.max(loaded, 0.85); // fonts in: nearly there even pre-load
  });

  return new Promise((resolve) => {
    const start = performance.now();
    let shown = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      // real-load target, but never slower than the cap allows
      const target = Math.max(loaded, elapsed / CAP_MS) * 100;
      shown = Math.min(100, Math.max(shown, target));
      count.textContent = String(Math.floor(shown)).padStart(3, '0');
      stroke.style.transform = `scaleX(${shown / 100})`;

      if (shown >= 100) {
        const wipe = root.animate(
          { transform: ['translateY(0)', 'translateY(-100%)'] },
          { duration: 450, easing: EASE_CSS, fill: 'forwards' },
        );
        wipe.finished.then(() => {
          root.remove();
          resolve();
        });
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};
