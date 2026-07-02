import { reducedMotion, EASE_CSS } from './env';

type Theme = 'light' | 'dark';

const current = (): Theme => {
  // light is the site default — dark only by explicit choice (stored
  // preference applied pre-paint, or the toggle)
  return (document.documentElement.dataset.theme as Theme | undefined) ?? 'light';
};

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('yasir:theme', theme);
  } catch {
    /* private mode — theme just won't persist */
  }
  updateLabels();
};

const updateLabels = () => {
  const next = current() === 'dark' ? 'light' : 'dark';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute(
      'aria-label',
      next === 'dark' ? btn.dataset.labelDark! : btn.dataset.labelLight!,
    );
  });
};

/** Theme switch as a View Transition radial wipe out of the toggle. */
const switchTheme = (origin: HTMLElement) => {
  const next: Theme = current() === 'dark' ? 'light' : 'dark';

  if (!document.startViewTransition || reducedMotion()) {
    apply(next);
    return;
  }

  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const vt = document.startViewTransition(() => apply(next));
  vt.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 600, easing: EASE_CSS, pseudoElement: '::view-transition-new(root)' },
    );
  });
};

export const initTheme = () => {
  updateLabels();
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => switchTheme(btn));
  });
};
