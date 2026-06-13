import { prm, reducedMotion } from './env';
import { initTheme } from './theme';
import { initProgress } from './progress';
import { initCursor } from './cursor';
import { initTerminal } from './terminal';
import { initHeroGL } from './hero';
import { initFooterGL } from './footer';
import { runPreloader } from './preloader';

/**
 * Orchestration. Two first-class paths with identical content:
 *  - motion: preloader → GSAP/Lenis suite → cursor → WebGL island
 *  - reduced motion: everything final immediately; GSAP never downloads
 */
const start = async () => {
  initTheme();
  initProgress();

  if (reducedMotion()) {
    initTerminal();
    return;
  }

  const motionReady = import('./motion');
  const preloaderDone = runPreloader();

  const motion = await motionReady;
  motion.prepareReveals();
  await preloaderDone;

  motion.initMotion();
  initTerminal();
  initCursor();
  initHeroGL();
  initFooterGL();

  // user flips the OS setting mid-session → degrade to the static page
  prm.addEventListener('change', (e) => {
    if (e.matches) motion.teardownMotion();
  });
};

start();
