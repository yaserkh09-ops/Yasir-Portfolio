# YASIR_ · ياســر — portfolio

Bilingual (EN/AR) portfolio built to the brand system in
`YASIR-brand-guideline-v1.md` — an engineered system that demonstrates its
own claims: visible grid, monospaced metrics, a green that means
"test passed," and published contrast ratios.

## Stack

- **Astro 5** (static output) · vanilla CSS custom properties, logical
  properties only
- **GSAP + ScrollTrigger + CustomEase** and **Lenis** smooth scroll —
  loaded only when `prefers-reduced-motion` is off
- **OGL** WebGL hero island — dynamically imported after first paint,
  gated on reduced motion, `deviceMemory >= 4`, working *hardware* GL
  (software rasterizers get the static SVG field)
- View Transitions API for the theme radial wipe + locale switches
- Self-hosted IBM Plex WOFF2 subsets (SIL OFL 1.1, license committed in
  `public/fonts/`)

## Locale trees

`/en/` and `/ar/` are sibling sites, never translations: copy is authored
natively per guideline §5, `<html lang dir>` set per tree, all motion
direction-aware (`src/scripts/env.ts → dirSign`).

## Commands

| Command            | Action                                          |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | dev server                                      |
| `npm run build`    | production build to `dist/`                     |
| `npm run preview`  | serve `dist/`                                   |
| `npm run contrast` | recompute WCAG ratios — run on ANY token change |

## Governance

- **Tokens** live in `src/styles/tokens.css`; verified contrast ratios are
  logged in its header comment. Recompute with `npm run contrast` and
  paste the output on every palette change (guideline §2 rule).
- **Text on glass is always full ink/paper** — stone tones fail 4.5:1
  over the worst-case canvas backdrop (see the math in `tokens.css`).
- **`public/metrics.json`** is committed from Lighthouse CI, never
  hand-edited. The hero terminal renders an em-dash for every `null` and
  only shows a pass-dot when a value meets target.

## Measured (local mobile-emulated Lighthouse, 2026-06-13)

| Page  | Perf | A11y | BP  | SEO | CLS | TBT   |
| ----- | ---- | ---- | --- | --- | --- | ----- |
| `/en/`| 99   | 100  | 100 | 100 | 0   | 10ms  |
| `/ar/`| 98   | 100  | 100 | 100 | 0   | 20ms  |

axe-core: 0 violations on both trees.

## Open items (intake)

- Production domain → set in `astro.config.mjs` (`site`)
- Contact mailbox → `CONTACT_EMAIL` in `src/i18n/index.ts`
- Replace work-card placeholder art with Stage-5 capture imagery
- Wire Lighthouse CI → `public/metrics.json`
