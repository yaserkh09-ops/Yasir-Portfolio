import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { dirSign, pointerFine } from './env';

gsap.registerPlugin(ScrollTrigger, CustomEase);
// the single brand easing, exact
const EASE = CustomEase.create('brand', '0.22, 1, 0.36, 1');

let lenis: Lenis | null = null;

/* ---------- smooth scroll ---------- */
const initLenis = () => {
  lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
};

/**
 * Initial hidden states for above-the-fold reveals. Called as soon as the
 * module loads — while the preloader still covers the page — so the wipe
 * never exposes un-clipped content for a frame.
 */
export const prepareReveals = () => {
  const lines = gsap.utils.toArray<HTMLElement>('[data-h1-line]');
  if (!lines.length) return;
  gsap.set(lines, { clipPath: 'inset(0% 0% 100% 0%)' });
  gsap.set(
    lines.map((l) => l.querySelector('.h1-line-inner')),
    { yPercent: 60 },
  );
  gsap.set('.nav-mark', { opacity: 0 });
};

/* ---------- hero headline: baseline clip reveal + scroll parallax ---------- */
const initHero = () => {
  const lines = gsap.utils.toArray<HTMLElement>('[data-h1-line]');
  if (!lines.length) return;

  const inners = lines.map((l) => l.querySelector<HTMLElement>('.h1-line-inner')!);

  gsap.to(lines, { clipPath: 'inset(0% 0% -8% 0%)', duration: 0.9, ease: EASE, stagger: 0.06 });
  gsap.to(inners, { yPercent: 0, duration: 0.9, ease: EASE, stagger: 0.06 });

  // subtle per-line parallax after reveal, <=24px total
  inners.forEach((inner, i) => {
    gsap.to(inner, {
      y: -(8 * (i + 1)),
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4,
      },
    });
  });

  // nav mark fades in with the headline (single reveal, never repeated)
  gsap.to('.nav-mark', { opacity: 1, duration: 0.6, ease: EASE });
};

/* ---------- work cards: clip reveal along the grid + scale settle ---------- */
const initWork = () => {
  const cards = gsap.utils.toArray<HTMLElement>('[data-work-card]');
  cards.forEach((card) => {
    const media = card.querySelector<HTMLElement>('[data-card-media]');
    const inner = card.querySelector<HTMLElement>('[data-card-media-inner]');
    if (!media || !inner) return;

    // reveal from inline-start, direction-aware. immediateRender:false —
    // the hidden state applies only when the trigger arms, so full renders
    // (print, snapshots, ScrollTrigger hiccups) never show gutted cards
    const from = dirSign === 1 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';
    gsap.fromTo(
      media,
      { clipPath: from },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1,
        ease: EASE,
        immediateRender: false,
        scrollTrigger: { trigger: card, start: 'top 78%', once: true },
      },
    );
    gsap.fromTo(
      inner,
      { scale: 1.04 },
      {
        scale: 1,
        duration: 1.2,
        ease: EASE,
        immediateRender: false,
        scrollTrigger: { trigger: card, start: 'top 78%', once: true },
      },
    );
  });
};

/* ---------- the system: the page's single pinned scene ---------- */
const initSystem = () => {
  const section = document.querySelector<HTMLElement>('[data-system]');
  if (!section) return;
  const steps = [...section.querySelectorAll<HTMLElement>('[data-system-step]')];
  const fill = section.querySelector<HTMLElement>('[data-system-progress]');
  if (!steps.length || !fill) return;

  section.dataset.mode = 'pinned';
  steps[0]!.classList.add('is-active');

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=150%',
    pin: true,
    scrub: 0.4,
    onUpdate(self) {
      fill.style.transform = `scaleX(${self.progress})`;
      const active = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
      steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
    },
  });
};

/* ---------- proof band: count-up once on first entry ---------- */
const initCounters = () => {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const value = parseFloat(el.dataset.count!);
    const decimals = parseInt(el.dataset.decimals ?? '0', 10);
    const suffix = el.dataset.suffix ?? '';
    const state = { v: 0 };
    // server-rendered final values stay visible at rest; zeroing happens
    // only when the count-up actually starts (never a "0px" static page)
    gsap.to(state, {
      v: value,
      duration: 1.4,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onStart() {
        el.textContent = (0).toFixed(decimals) + suffix;
      },
      onUpdate() {
        el.textContent = state.v.toFixed(decimals) + suffix;
      },
    });
  });
};

/* ---------- CTA wordmark: the stroke draws in (single <=1s reveal) ---------- */
const initMark = () => {
  const mark = document.querySelector<HTMLElement>('[data-mark]');
  if (!mark) return;
  const from = dirSign === 1 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';
  const underscore = mark.querySelector<HTMLElement>('[data-mark-underscore]');

  // hidden states arm with the trigger (immediateRender:false) — a full
  // page render at rest always shows the complete mark
  const tl = gsap.timeline({
    scrollTrigger: { trigger: mark, start: 'top 88%', once: true },
  });
  tl.fromTo(
    mark,
    { clipPath: from },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: EASE, immediateRender: false },
  );
  if (underscore)
    tl.fromTo(
      underscore,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.2, ease: EASE, immediateRender: false },
      '-=0.1',
    );
};

/* ---------- statement: glass chips parallax against the message ---------- */
const initStatement = () => {
  const section = document.querySelector<HTMLElement>('[data-statement]');
  // chips only float (absolute) on wide screens — parallax matches that
  if (!section || !window.matchMedia('(min-width: 1024px)').matches) return;
  gsap.utils.toArray<HTMLElement>('[data-chip]', section).forEach((chip) => {
    const speed = parseFloat(chip.dataset.speed ?? '0.3');
    gsap.fromTo(
      chip,
      { y: 110 * speed },
      {
        y: -110 * speed,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
      },
    );
  });
};

/* ---------- magnetic CTA (<=6px, pointer:fine only) ---------- */
const initMagnetic = () => {
  if (!pointerFine.matches) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: EASE });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: EASE });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 12); // ±6px
      yTo(((e.clientY - r.top) / r.height - 0.5) * 12);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
};

/** Full motion suite — only ever called when reduced-motion is OFF. */
export const initMotion = () => {
  initLenis();
  initHero();
  initStatement();
  initWork();
  initSystem();
  initCounters();
  initMark();
  initMagnetic();
};

/** Mid-session switch to reduced motion: tear everything down to statics. */
export const teardownMotion = () => {
  lenis?.destroy();
  lenis = null;
  ScrollTrigger.getAll().forEach((st) => st.kill());
  gsap.globalTimeline.clear();
  document.querySelectorAll<HTMLElement>('[data-system]').forEach((s) => {
    delete s.dataset.mode;
  });
  // restore anything mid-tween to its resting state
  gsap.set(
    '[data-h1-line], .h1-line-inner, .nav-mark, [data-chip], [data-card-media], [data-card-media-inner], [data-mark], [data-mark-underscore]',
    { clearProps: 'all' },
  );
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    el.textContent =
      parseFloat(el.dataset.count!).toFixed(parseInt(el.dataset.decimals ?? '0', 10)) +
      (el.dataset.suffix ?? '');
  });
};
