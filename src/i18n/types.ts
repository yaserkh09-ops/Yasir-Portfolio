export interface WorkCard {
  /** Client brand names stay Latin in both trees (marks are never translated). */
  client: string;
  sector: string;
  year: string;
  /** Lead copy: what the site is and the service it provides. */
  details: string;
  /** The work package — what was actually done (checkmark list). */
  scope: string[];
  /** Process paragraphs: why it was built, how, and how it's maintained. */
  process: string[];
  /** Platform & tools chips (Wix, Webflow, custom code, …). */
  tools: string[];
  /** One line telling the reader how this maps to their own project. */
  takeaway: string;
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
    cta: string;
    ctaNote: string;
    terminalAria: string;
    terminalTitle: string;
    terminalCmd: string;
    /** Metric rows — keys are locale-authored; metric ids map to metrics.json. */
    terminalRows: { key: string; metric: string }[];
    notMeasured: string;
    metricsNote: string;
  };
  /** Hero-extension section: the field flows behind one centered message
   *  with glass tag chips floating in parallax around it. */
  statement: {
    message: string;
    chips: string[];
  };
  work: {
    heading: string;
    line: string;
    modalClose: string;
    modalVisit: string;
    /** Secondary modal CTA — jumps to the contact section. */
    modalContact: string;
    /** Suffix for screenshot alt text: "<client> — <shotAlt>". */
    shotAlt: string;
    /** Modal section labels. */
    scopeLabel: string;
    processLabel: string;
    toolsLabel: string;
    takeawayLabel: string;
    cards: WorkCard[];
  };
  system: {
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
    /** Contact popup (opened by the primary CTA buttons). */
    connectTitle: string;
    whatsapp: string;
    call: string;
  };
  footer: {
    rights: string;
  };
}
