import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', locale: 'en-US' })).newPage();
await p.goto('http://localhost:4360/', { waitUntil: 'load' });
await p.waitForURL('**/ar/', { timeout: 8000 });
await p.waitForLoadState('networkidle');
await p.waitForTimeout(1500);
const state = await p.evaluate(() => ({
  path: location.pathname, lang: document.documentElement.lang, dir: document.documentElement.dir,
  theme: document.documentElement.dataset.theme ?? '(none)',
  bg: getComputedStyle(document.body).backgroundColor,
}));
console.log('root landing:', JSON.stringify(state));
const work = await p.$('#work'); await work.scrollIntoViewIfNeeded(); await p.waitForTimeout(1400);
await p.evaluate(() => window.scrollBy(0, 760)); await p.waitForTimeout(1200);
const img = await p.evaluate(() => {
  const i = [...document.querySelectorAll('.card-shot')].find(x => x.getAttribute('src')?.includes('alreaiah'));
  return i ? { loaded: i.complete && i.naturalWidth > 0 } : 'not found';
});
console.log('alreaiah shot:', JSON.stringify(img));
const anchors = await p.$$('.card-anchor');
await anchors[4].click(); await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/v11-alreaiah-modal.png' });
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
await p.evaluate(() => localStorage.setItem('yasir:theme', 'dark'));
await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600);
const dark = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor }));
console.log('stored dark pref honored:', JSON.stringify(dark));
await b.close(); console.log('done');
