import { pointerFine, reducedMotion } from './env';

const INTERACTIVE = 'a, button, [data-magnetic], input, textarea, select, summary';

/**
 * 6px ink dot + trailing 28px ring; ring flattens into a short Stroke over
 * interactive elements (CSS class). Pointer:fine + motion-allowed only;
 * the native cursor is never hidden. rAF stops when the tab is hidden.
 */
export const initCursor = () => {
  if (!pointerFine.matches || reducedMotion()) return;

  const root = document.querySelector<HTMLElement>('[data-cursor-root]');
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!root || !dot || !ring) return;

  let tx = -100;
  let ty = -100;
  let rx = -100;
  let ry = -100;
  let visible = false;
  let raf = 0;

  const loop = () => {
    rx += (tx - rx) * 0.16;
    ry += (ty - ry) * 0.16;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    raf = requestAnimationFrame(loop);
  };

  document.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      visible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      rx = tx;
      ry = ty;
    }
    const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
    root.classList.toggle('is-interactive', !!hit);
  });

  document.addEventListener('pointerleave', () => {
    visible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(loop);
    }
  });

  raf = requestAnimationFrame(loop);
};
