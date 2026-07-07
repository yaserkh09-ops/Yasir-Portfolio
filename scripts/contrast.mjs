/**
 * Contrast governance — YASIR_ brand guideline §2.
 * Recomputes WCAG 2.1 ratios for every text-bearing pair, including the
 * glass surfaces composited over their WORST-CASE canvas backdrop
 * (a fully ink / fully paper particle cluster — denser than the real
 * field ever gets, so real ratios are always >= these).
 *
 * Run `npm run contrast` after ANY token change and paste the output
 * into the header comment of src/styles/tokens.css.
 *
 * Assumption: backdrop-filter saturate(160%) is ignored here — worst-case
 * backdrops are near-neutral warm grays, so saturation shift is < 1 RGB
 * step. blur() does not change average luminance.
 */

const T = {
  paper: '#F8F6F1',
  ink: '#111111',
  'stone-700': '#57534E',
  'stone-500': '#6C655F',
  'signal-green': '#0B7A40',
  surface: '#161513',
  panel: '#211F1B',
  'stone-400': '#A8A29A',
  'signal-green-d': '#3FBF7F',
  white: '#FFFFFF',
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb) =>
  '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase();

// sRGB relative luminance, WCAG 2.1
const lum = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [l1, l2] = [lum(hex(a)), lum(hex(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// color-mix(in srgb, A p%, B (100-p)%) — Astro/browser srgb mix is linear in 8-bit channels
const mix = (a, b, pA) => hex(a).map((c, i) => c * pA + hex(b)[i] * (1 - pA));

const fmt = (r) => r.toFixed(2) + ' : 1';
const check = (r, min = 4.5) => (r >= min ? 'PASS' : 'FAIL') + ` (>= ${min})`;

// Glass opacities — keep in sync with --glass-bg in tokens.css
const GLASS_LIGHT = 0.64;
const GLASS_DARK = 0.66;
// The particle field never exceeds ~30% dot coverage; behind blur(28px)
// the backdrop averages toward this. TEXT is still checked against the
// theoretical 100% cluster; non-text green indicators against the
// realistic field maximum.
const FIELD_MAX = 0.3;

console.log('— Glass surfaces (text: vs 100% cluster · non-text: vs 30% field) —\n');

// Light glass over a 100%-ink particle cluster (theoretical darkest)
const glassLightWorst = toHex(mix(T.paper, T.ink, GLASS_LIGHT));
const rInkOnGlassLight = ratio(T.ink, glassLightWorst);
console.log(`glass-light(${GLASS_LIGHT * 100}%) text-worst backdrop = ${glassLightWorst}`);
console.log(`  ink on glass-light        = ${fmt(rInkOnGlassLight)}  ${check(rInkOnGlassLight)}`);
const rStone700GlassLight = ratio(T['stone-700'], glassLightWorst);
console.log(`  stone-700 on glass-light  = ${fmt(rStone700GlassLight)}  ${check(rStone700GlassLight)}`);
const fieldLight = toHex(mix(T.ink, T.paper, FIELD_MAX)); // 30% ink dots on paper
const glassLightReal = toHex(mix(T.paper, fieldLight, GLASS_LIGHT));
const rGreenGlassLight = ratio(T['signal-green'], glassLightReal);
console.log(`  signal-green on g-light   = ${fmt(rGreenGlassLight)}  ${check(rGreenGlassLight, 3)} — NON-TEXT ONLY (vs real field max ${glassLightReal})`);

// Dark glass over a 100%-paper particle cluster (theoretical brightest)
const glassDarkWorst = toHex(mix(T.surface, T.paper, GLASS_DARK));
const rPaperOnGlassDark = ratio(T.paper, glassDarkWorst);
console.log(`\nglass-dark(${GLASS_DARK * 100}%) text-worst backdrop  = ${glassDarkWorst}`);
console.log(`  paper on glass-dark       = ${fmt(rPaperOnGlassDark)}  ${check(rPaperOnGlassDark)}`);
const rStone400GlassDark = ratio(T['stone-400'], glassDarkWorst);
console.log(`  stone-400 on glass-dark   = ${fmt(rStone400GlassDark)}  ${check(rStone400GlassDark)}`);
const fieldDark = toHex(mix(T.paper, T.surface, FIELD_MAX)); // 30% paper dots on surface
const glassDarkReal = toHex(mix(T.surface, fieldDark, GLASS_DARK));
const rGreenDGlassDark = ratio(T['signal-green-d'], glassDarkReal);
console.log(`  signal-green-d on g-dark  = ${fmt(rGreenDGlassDark)}  ${check(rGreenDGlassDark, 3)} — NON-TEXT ONLY (vs real field max ${glassDarkReal})`);

console.log('\n— Core pairs (must match guideline §2.3) —\n');
const pairs = [
  ['ink', 'paper'],
  ['stone-700', 'paper'],
  ['stone-500', 'paper'],
  ['signal-green', 'paper'],
  ['white', 'signal-green'],
  ['paper', 'surface'],
  ['paper', 'panel'],
  ['stone-400', 'surface'],
  ['signal-green-d', 'surface'],
  ['ink', 'signal-green-d'],
];
for (const [a, b] of pairs) {
  const r = ratio(T[a], T[b]);
  console.log(`  ${a} on ${b} = ${fmt(r)}  ${check(r)}`);
}
