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

**Defaults (owner decisions):** the root `/` sends everyone to `/ar/`
(`src/pages/index.astro`; Astro's auto-redirect is disabled in
`astro.config.mjs`), and light is the theme for first-time visitors —
dark applies only via the toggle (persisted, applied pre-paint).

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

## Measured (local mobile-emulated Lighthouse, 2026-07-06)

| Page  | Perf | A11y | BP  | SEO | CLS   | LCP  |
| ----- | ---- | ---- | --- | --- | ----- | ---- |
| `/en/`| 95   | 100  | 100 | 100 | 0.001 | 2.2s |
| `/ar/`| 96   | 100  | 100 | 100 | 0.001 | 2.5s |

axe-core: 0 violations on both trees, including with a project modal open.
The hero terminal reads these from `public/metrics.json` (worst of the two
pages; `satisfaction` is the studio's stated commitment, not a Lighthouse
output).

## Open items (intake)

- Production domain → set in `astro.config.mjs` (`site`)
- Replace `public/work/*.jpg` with higher-res hero captures when
  available (current sources were downscaled in transit; raise the
  `SHOT_W` caps in `Work.astro` accordingly)
- Wire Lighthouse CI → `public/metrics.json`
