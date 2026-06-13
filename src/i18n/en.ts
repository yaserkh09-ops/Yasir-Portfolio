import type { Dict } from './types';

/**
 * English copy — authored per guideline §5: first person, short declarative
 * sentences, numbers wherever a claim is made, no hype adjectives.
 * This is NOT a source for translation; ar.ts is written natively.
 */
export const en: Dict = {
  meta: {
    title: 'YASIR_ — Independent design & web studio',
    description:
      'Bilingual Arabic/English websites and brand systems for Saudi organizations — engineered to verifiable standards, written to convert, delivered fast.',
  },
  skipLink: 'Skip to content',
  nav: {
    work: 'Work',
    process: 'Process',
    contact: 'Contact',
    localeSwitch: 'العربية',
    localeSwitchAria: 'اقرأ هذه الصفحة بالعربية',
    themeToDark: 'Switch to dark theme',
    themeToLight: 'Switch to light theme',
    homeAria: 'YASIR — home',
  },
  hero: {
    eyebrow: 'Independent web design & development partner',
    h1Lines: ['Design systems.', 'Fast, accessible,', 'reliable.'],
    sub: 'I build Arabic/English websites and brand systems for Saudi organizations — each language written natively, every claim measured.',
    cta: 'Start a project',
    ctaNote: 'Replies in English or Arabic',
    terminalAria: 'Live build metrics',
    terminalTitle: 'yasir@studio — lighthouse',
    terminalCmd: 'lighthouse --preset=mobile ./',
    notMeasured: 'not yet measured',
    metricsNote: 'Published when measured — never claimed.',
  },
  ticker: [
    'Two languages, each written natively',
    'Brand systems with governance',
    'Lighthouse 100 · WCAG 2.1 AA · technical SEO',
    'The right platform, per client',
    'Your team runs it after handoff',
  ],
  work: {
    label: '01 — Selected work',
    heading: 'Selected work.',
    line: 'Outcomes over deliverables — each case records what changed.',
    cardCta: 'View case',
    cards: [
      {
        client: 'Najd Hands',
        sector: 'Nonprofit',
        year: '2025',
        line: 'A charity site rebuilt in both languages — each written from scratch for its reader.',
      },
      {
        client: 'SIPHA',
        sector: 'Healthcare',
        year: '2025',
        line: 'Brand system and site for a pharma supplier — governed, documented, handed off.',
      },
      {
        client: 'Four Colors',
        sector: 'Print production',
        year: '2026',
        line: 'A print house’s catalogue moved online — fast on the phones its clients actually use.',
      },
      {
        client: 'Anjal Schools',
        sector: 'Education',
        year: '2026',
        line: 'A school site parents can navigate — two languages, one structure.',
      },
    ],
  },
  system: {
    label: '02 — Process',
    heading: 'One process, four gates.',
    steps: [
      {
        label: '01 Discover',
        copy: 'Your goals, your users, your constraints — written down and agreed before anything is drawn.',
      },
      {
        label: '02 Design',
        copy: 'A system, not screens: tokens, type and components that govern every page that follows.',
      },
      {
        label: '03 Engineer',
        copy: 'Built to numbers — Lighthouse, WCAG 2.1 AA, Core Web Vitals — measured on every release.',
      },
      {
        label: '04 Handoff',
        copy: 'Documentation and training until your team runs it without me.',
      },
    ],
  },
  proof: {
    line: 'Numbers are claims. These are measured.',
    metrics: [
      {
        value: 17.48,
        decimals: 2,
        suffix: ':1',
        label: 'Headline contrast ratio, computed per WCAG 2.1',
      },
      {
        value: 44,
        decimals: 0,
        suffix: 'px',
        label: 'Smallest interactive target on this site',
      },
      {
        value: 100,
        decimals: 0,
        suffix: '%',
        label: 'Text shipped as live HTML — selectable, indexable',
      },
    ],
  },
  cta: {
    label: '03 — Contact',
    heading: 'Tell me what needs to work.',
    line: 'One reply, usually within a day — in English or Arabic, whichever you prefer.',
    button: 'Start a project',
    emailLabel: 'Or write directly:',
  },
  footer: {
    a11yNote: 'Motion respects your system preferences.',
    rights: '© 2026 — All work shown with permission.',
  },
};
