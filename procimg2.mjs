import { chromium } from 'playwright-core';
const SRC = '/tmp/claude-0/-home-user-Yasir-Portfolio/8093c3a4-9a06-5fe1-93e5-c15fe5ce056d/scratchpad';
const MAP = [
  ['upload-1.webp', 'sipha'], ['upload-2.webp', 'anjal'], ['upload-3.webp', 'fourcolors'],
  ['upload-4.webp', 'abdulilah'], ['upload-5.webp', 'najdhands'],
];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
for (const [file, name] of MAP) {
  const probe = await (await b.newContext()).newPage();
  await probe.goto(`file://${SRC}/${file}`, { waitUntil: 'load' });
  const dims = await probe.evaluate(async () => {
    const i = document.querySelector('img');
    await i.decode();
    return { w: i.naturalWidth, h: i.naturalHeight };
  });
  await probe.close();
  const outW = Math.min(dims.w, 1600);
  const outH = Math.round(outW * 0.625);
  const p = await (await b.newContext({ viewport: { width: outW, height: outH } })).newPage();
  await p.setContent(`<style>*{margin:0}</style><img src="file://${SRC}/${file}" style="width:${outW}px;display:block">`);
  await p.waitForFunction(() => {
    const i = document.querySelector('img');
    return i && i.complete && i.naturalWidth > 0;
  });
  await p.evaluate(() => document.querySelector('img').decode());
  await p.waitForTimeout(150);
  await p.screenshot({ path: `public/work/${name}.jpg`, type: 'jpeg', quality: 82 });
  await p.close();
  console.log(`${name}.jpg  src ${dims.w}x${dims.h} -> ${outW}x${outH}`);
}
await b.close();
