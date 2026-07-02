import type { Dict } from './types';

/**
 * English copy — authored per guideline §5: first person, short declarative
 * sentences, numbers wherever a claim is made, no hype adjectives.
 * This is NOT a source for translation; ar.ts is written natively.
 */
export const en: Dict = {
  meta: {
    title: 'YASIR_ — Independent web design & development partner',
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
    h1Lines: ['In constant motion', 'towards impactful', 'digital presence.'],
    sub: 'As your partner, you will find me in every step of your journey to have a strong digital presence, from a strong design system to the dream website.',
    cta: 'Get in Touch',
    ctaNote: 'Great partnerships start with a conversation',
    terminalAria: 'Live build metrics',
    terminalTitle: 'Your trusted partner',
    terminalCmd: 'Standards I never negotiate',
    notMeasured: 'not yet measured',
    metricsNote: 'Let’s get 8 billion people to see you!',
  },
  ticker: [
    'Two languages, each written natively',
    'The right platform, per client',
    'Brand systems for consistency',
    'Fast, accessible, and reliable',
    'The digital world is waiting for you',
  ],
  work: {
    label: '01 — Selected work',
    heading: 'Selected work.',
    line: 'Outcomes over deliverables — each case gets tailored solutions.',
    cardCta: 'View case',
    modalClose: 'Close',
    modalVisit: 'Visit live site',
    modalContact: 'Start a similar project',
    // TODO(yasir): fill each card's `url` with the live project link when provided.
    cards: [
      {
        client: 'Najd Hands',
        sector: 'Nonprofit',
        year: '2025',
        line: 'A charity site rebuilt in both languages — each written from scratch for its reader.',
        details:
          'A full rebuild for a Saudi charity: one structure, two languages, each written natively for its reader. Clear paths to donate, volunteer and reach the team — on any device.',
        bullets: [
          'One structure serving Arabic and English equally',
          'Clear donate, volunteer and contact paths',
          'Handed off with documentation and training',
        ],
        url: null,
      },
      {
        client: 'SIPHA',
        sector: 'Healthcare',
        year: '2025',
        line: 'Brand system and site for a pharma supplier — governed, documented, handed off.',
        details:
          'A brand system and website for a pharmaceutical supplier — tokens, type and components documented so the team can extend it, with a bilingual site built on top.',
        bullets: [
          'Design tokens, type and components — documented',
          'Bilingual site built on the brand system',
          'The team extends it without outside help',
        ],
        url: null,
      },
      {
        client: 'Four Colors',
        sector: 'Print production',
        year: '2026',
        line: 'A print house’s catalogue moved online — fast on the phones its clients actually use.',
        details:
          'A print house’s catalogue moved online: fast on mid-range phones, easy to browse, and simple for the team to keep up to date.',
        bullets: [
          'Catalogue browsable on mid-range phones',
          'Simple updates for the in-house team',
          'Fast loading on real-world connections',
        ],
        url: null,
      },
      {
        client: 'Anjal Schools',
        sector: 'Education',
        year: '2026',
        line: 'A school site parents can navigate — two languages, one structure.',
        details:
          'A school website parents actually navigate: admissions, calendars and contacts in two languages, one consistent structure.',
        bullets: [
          'Admissions, calendars and contacts — two languages',
          'One consistent structure parents learn once',
          'Accessible navigation for every visitor',
        ],
        url: null,
      },
    ],
  },
  system: {
    label: '02 — Process',
    heading: 'One process, four phases.',
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
        copy: 'Crafting to magic — based on powerful platforms like Webflow or even custom code to release what satisfies your needs.',
      },
      {
        label: '04 Handoff',
        copy: 'Documentation and training until you are comfortable. From here — long-term partnership just began!',
      },
    ],
  },
  proof: {
    line: 'Numbers never lie.',
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
    label: 'CONTACT ME',
    heading: 'Tell me what needs to work.',
    line: 'One reply, usually within a day — in English or Arabic, whichever you prefer.',
    button: 'Get in Touch',
    emailLabel: 'Or write directly:',
  },
  footer: {
    a11yNote: 'Motion respects your system preferences.',
    rights: '© 2026 — All work shown with permission.',
  },
};
