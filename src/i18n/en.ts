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
      'Your partner for bilingual Arabic/English websites and brand systems — from a strong design system to the website you dream of, built fast and built right.',
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
    terminalRows: [
      { key: 'Performance', metric: 'performance' },
      { key: 'Accessibility', metric: 'accessibility' },
      { key: 'Partner satisfaction', metric: 'satisfaction' },
    ],
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
    heading: 'Selected work.',
    line: 'Outcomes over deliverables — each case gets tailored solutions.',
    modalClose: 'Close',
    modalVisit: 'Visit live site',
    modalContact: 'Start a similar project',
    shotAlt: 'homepage screenshot',
    scopeLabel: 'The work package',
    processLabel: 'The process',
    toolsLabel: 'Platform & tools',
    takeawayLabel: 'For your project',
    cards: [
      {
        client: 'Najd Hands',
        sector: 'Children’s care',
        year: '2025',
        details:
          'The website of Najd Hands day-care centres, serving children with disabilities across 18 branches: programs, family stories, and clear paths to enrol and reach the team.',
        scope: [
          'Brand identity — colors, structure and message',
          'Brainstorming and prototyping sessions',
          'Copywriting, page by page',
          'Design and the full website build',
        ],
        process: [
          'Najd Hands was the complete journey, started from a blank page: brainstorming sessions first, then a brand identity — its colors, its structure, its message — then prototypes to test how an anxious, short-on-time parent would actually move through the site.',
          'With the foundations agreed, I wrote the copy, designed the pages and developed the whole website — one continuous process, one pair of hands, from first sketch to a launched home for 18 branches.',
        ],
        tools: ['Brand identity', 'Prototyping', 'Copywriting', 'Full web build'],
        takeaway:
          'Starting from zero? This is the full package — brand, words and website in one continuous process.',
        url: 'https://najdhands.netlify.app',
        image: '/work/najdhands.jpg',
        gallery: ['/work/najdhands-2.jpg', '/work/najdhands-3.jpg'],
      },
      {
        client: 'SIPHA',
        sector: 'Healthcare events',
        year: '2025',
        details:
          'The website of SIPHA, the Saudi International Pharmaceutical Conference: program, speakers, partners and registration — with a live countdown to event day.',
        scope: [
          'Ongoing site management on Wix',
          'A focused redesign session',
          'Email campaigns to the attendee list',
          'Live updates through the conference days',
        ],
        process: [
          'SIPHA was a management engagement: the conference already had a website on Wix — what it needed was a steady hand. I began with a redesign session that sharpened what attendees use most: the countdown, the program, and a register button never more than a glance away.',
          'From there to event day I ran the email campaigns and kept the site current through the conference itself — schedule changes going live in the minutes that matter, not the morning after.',
        ],
        tools: ['Wix', 'Email campaigns', 'Content management'],
        takeaway:
          'Running an event? This is the package that keeps a conference site alive — managed, current, and talking to its audience.',
        url: 'https://www.sipha-sps.com',
        image: '/work/sipha.jpg',
        gallery: ['/work/sipha-2.jpg', '/work/sipha-3.jpg'],
      },
      {
        client: 'Four Colors',
        sector: 'Print production',
        year: '2026',
        details:
          'A print house’s catalogue moved online: fast on mid-range phones, easy to browse, and simple for the team to keep up to date.',
        scope: [
          'Client brand kit translated to the web',
          'High-end Webflow design and build',
          'A browsable catalogue structure',
          'Self-service updates for the in-house team',
        ],
        process: [
          'Four Colors handed me a ready brand kit — thirty years of print identity — and asked for a website that lives up to it. My job was translation: from ink on paper to a high-end build on Webflow.',
          'The catalogue became browsable departments — offset, digital, design, advertising — and because it lives on Webflow, the in-house team updates it themselves, no developer needed.',
        ],
        tools: ['Webflow', 'Client brand kit'],
        takeaway:
          'Already have a brand kit? This is how it becomes a high-end website that feels unmistakably yours.',
        url: 'https://www.fourcolors.sa',
        image: '/work/fourcolors.jpg',
        gallery: ['/work/fourcolors-2.jpg', '/work/fourcolors-3.jpg'],
      },
      {
        client: 'Anjal Schools',
        sector: 'Education',
        year: '2026',
        details:
          'A school website parents actually navigate: admissions, calendars and contacts in two languages, one consistent structure.',
        scope: [
          'A full brand kit grown from a single logo',
          'Website design and build on Webflow',
          'Ongoing maintenance after launch',
          'Ad campaigns that bring parents in',
        ],
        process: [
          'Anjal arrived with exactly one asset: a logo. I grew it into a full brand kit — palette, type, illustration style — so the school finally had a visual language, not just a mark.',
          'On that foundation I designed and built the website on Webflow, and the work didn’t stop at launch: I maintain the site and run the ad campaigns that bring parents to pages ready to answer them.',
        ],
        tools: ['Webflow', 'Brand kit', 'Ad campaigns'],
        takeaway:
          'Only have a logo? A whole brand — and the website to carry it — can grow from there.',
        url: 'https://anjal-schools.webflow.io',
        image: '/work/anjal.jpg',
        gallery: ['/work/anjal-2.jpg', '/work/anjal-3.jpg'],
      },
      {
        client: 'Alreaiah Almotanahiah',
        sector: 'Care & education group',
        year: '2025',
        details:
          'The website of Alreaiah Almotanahiah, a Saudi group for education, training and comprehensive care: two arms, thirteen facilities across the Kingdom, and their news — in both languages.',
        scope: [
          'Client brand kit translated to the web',
          'High-end bilingual Webflow build',
          'A structure that explains two arms and 13 facilities',
        ],
        process: [
          'Alreaiah brought a ready brand kit and a complex story: a holding group with two arms — day-care centres and schools — and thirteen facilities across the Kingdom.',
          'I turned the kit into a high-end Webflow build that explains the whole before the parts, in Arabic and English written natively — so families, partners and talent each find their doorway.',
        ],
        tools: ['Webflow', 'Client brand kit', 'Bilingual build'],
        takeaway:
          'A brand with many parts? Structure is the service — one site that makes the whole group legible.',
        url: 'https://alreaiah.netlify.app',
        image: '/work/alreaiah.jpg',
        gallery: ['/work/alreaiah-2.jpg', '/work/alreaiah-3.jpg'],
      },
      {
        client: 'Abdulilah Alrajhi',
        sector: 'Talent portfolio',
        year: '2025',
        details:
          'A portfolio for Abdulilah Alrajhi — actor, model and voice-over artist based in Riyadh: photos, TV shows and ad work, with booking contact one scroll away.',
        scope: [
          'Fully custom design and build',
          'Interactive parallax scroll animations',
          'Database-backed content',
          'A tailored dashboard for managing every asset',
        ],
        process: [
          'A talent portfolio has one job: impress in seconds. So this one went beyond templates — a fully custom build with interactive, parallax scroll animation that gives the page itself a sense of stagecraft.',
          'Behind the curtain it runs on a database with a tailored dashboard: photos, TV work and ads are added or swapped from one panel, without ever touching the code.',
        ],
        tools: ['Custom code', 'Parallax animation', 'Database + dashboard'],
        takeaway:
          'Need something templates can’t do? Custom code opens every door — and a dashboard keeps it yours to run.',
        url: 'https://abdulilahalrajhi.com',
        image: '/work/abdulilah.jpg',
        gallery: ['/work/abdulilah-2.jpg', '/work/abdulilah-3.jpg'],
      },
    ],
  },
  system: {
    heading: 'One process, four phases.',
    steps: [
      {
        label: '01 Discover',
        copy: 'I start by listening: your goals, your users, your constraints — written down and agreed before anything is drawn.',
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
        label: 'Every button sized for real thumbs — nothing fiddly',
      },
      {
        value: 100,
        decimals: 0,
        suffix: '%',
        label: 'Real, living text you can select and search — never an image',
      },
    ],
  },
  cta: {
    label: 'CONTACT ME',
    heading: 'Tell me about your dream project.',
    line: 'One reply, usually within a day — in English or Arabic, whichever you prefer.',
    button: 'Get in Touch',
    emailLabel: 'Or write directly:',
  },
  footer: {
    rights: '© 2026 — All work shown with permission.',
  },
};
