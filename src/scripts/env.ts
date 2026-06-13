/** Shared environment probes. */

export const prm = window.matchMedia('(prefers-reduced-motion: reduce)');
export const pointerFine = window.matchMedia('(pointer: fine)');

export const dir = (document.documentElement.dir || 'ltr') as 'ltr' | 'rtl';
/** Multiply any GSAP x/translate value by this to stay direction-aware. */
export const dirSign = dir === 'rtl' ? -1 : 1;

export const EASE_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const reducedMotion = () => prm.matches;
