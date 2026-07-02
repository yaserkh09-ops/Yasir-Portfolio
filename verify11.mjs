import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
// 1) root redirect with a dark-preferring, English-language browser
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', locale: 'en-US' })).newPage();
await p.goto('http://localhost:4360/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
const state = await p.evaluate(() => ({
  path: location.pathname,
  lang: document.documentElement.lang,
  theme: document.documentElement.dataset.theme ?? '(none)',
  bg: getComputedStyle(document.body).backgroundColor,
}));
console.log('root landing (system-dark, en browser):', JSON.stringify(state));
// 2) Alreaiah card + modal
const work = await p.$('#work'); await work.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
await p.evaluate(() => window.scrollBy(0, 760)); await p.waitForTimeout(1200);
const img = await p.evaluate(() => {
  const i = [...document.querySelectorAll('.card-shot')].find(x => x.getAttribute('src')?.includes('alreaiah'));
  return i ? { ok: i.complete && i.naturalWidth > 0 } : 'not found';
});
console.log('alreaiah shot:', JSON.stringify(img));
const anchors = await p.$$('.card-anchor');
await anchors[4].click(); await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/v11-alreaiah-modal.png' });
await p.keyboard.press('Escape');
// 3) stored dark preference still honored
await p.evaluate(() => localStorage.setItem('yasir:theme', 'dark'));
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(600);
const dark = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor }));
console.log('after stored dark pref:', JSON.stringify(dark));
await b.close(); console.log('done');
