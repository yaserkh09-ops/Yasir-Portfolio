export interface WorkCard {
  /** Client brand names stay Latin in both trees (marks are never translated). */
  client: string;
  sector: string;
  year: string;
  line: string;
  /** Longer copy shown in the project modal. */
  details: string;
  /** Storytelling paragraphs after the lead (challenge → approach). */
  story: string[];
  /** Checkmark bullet points in the project modal (Stripe-style). */
  bullets: string[];
  /** Live project URL — modal renders its visit button only when set. */
  url: string | null;
  /** Screenshot under /public — placeholder art renders while null. */
  image: string | null;
  /** Extra section captures shown in the modal gallery. */
  gallery: string[];
}

export interface SystemStep {
  /** Mono label — remains Latin in both trees (guideline §3.3 / §3.4.2). */
  label: string;
  copy: string;
}

export interface ProofMetric {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
}

export interface Dict {
  meta: { title: string; description: string };
  skipLink: string;
  nav: {
    work: string;
    process: string;
    contact: string;
    /** Visible text of the locale switch — written in the TARGET language. */
    localeSwitch: string;
    localeSwitchAria: string;
    themeToDark: string;
    themeToLight: string;
    homeAria: string;
  };
  hero: {
    eyebrow: string;
    /** One entry per revealed line. */
    h1Lines: string[];
    sub: string;
    cta: string;
    ctaNote: string;
    terminalAria: string;
    terminalTitle: string;
    terminalCmd: string;
    notMeasured: string;
    metricsNote: string;
  };
  ticker: string[];
  work: {
    label: string;
    heading: string;
    line: string;
    cardCta: string;
    modalClose: string;
    modalVisit: string;
    /** Secondary modal CTA — jumps to the contact section. */
    modalContact: string;
    /** Suffix for screenshot alt text: "<client> — <shotAlt>". */
    shotAlt: string;
    cards: WorkCard[];
  };
  system: {
    label: string;
    heading: string;
    steps: SystemStep[];
  };
  proof: {
    line: string;
    metrics: ProofMetric[];
  };
  cta: {
    label: string;
    heading: string;
    line: string;
    button: string;
    emailLabel: string;
  };
  footer: {
    a11yNote: string;
    rights: string;
  };
}
