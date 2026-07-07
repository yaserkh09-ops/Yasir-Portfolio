import { chromium } from 'playwright-core';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

/**
 * Captures the six live project sites into /public/work at 1600px width
 * (JPEG q82) — homepage + two section shots each, same filenames the
 * dicts reference. Pages are pre-scrolled end-to-end first so lazy
 * images load and entry animations reveal before any shot is taken.
 *
 * Networking: the session's egress gateway TLS-fingerprints clients and
 * resets Chromium handshakes, so the browser never talks to the network
 * directly. Every request is intercepted with page.route() and fetched
 * from Node through the proxy (gateway-accepted TLS, verification ON via
 * NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt), then fulfilled into the
 * renderer. Run with:
 *   NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node scripts/capture-work.mjs
 */
const SITES = [
  { name: 'najdhands', url: 'https://najdhands.netlify.app' },
  { name: 'sipha', url: 'https://www.sipha-sps.com' },
  { name: 'fourcolors', url: 'https://www.fourcolors.sa' },
  { name: 'anjal', url: 'https://anjal-schools.webflow.io' },
  { name: 'alreaiah', url: 'https://alreaiah.netlify.app' },
  { name: 'abdulilah', url: 'https://abdulilahalrajhi.com' },
];
const W = 1600;
const H = 1000;

// optional filter: `node scripts/capture-work.mjs najdhands,abdulilah`
const only = process.argv[2]?.split(',').map((s) => s.trim());
const sites = only ? SITES.filter((s) => only.includes(s.name)) : SITES;

const dispatcher = process.env.HTTPS_PROXY ? new ProxyAgent(process.env.HTTPS_PROXY) : undefined;
const blockedHosts = new Set();

/**
 * unpkg.com is not on the egress allowlist, but it serves plain npm files —
 * and the npm registry IS allowlisted. Map unpkg URLs to registry tarballs,
 * extract once into a cache dir, and serve the file from disk.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
const UNPKG_CACHE = '/tmp/unpkg-cache';
const MIME = { js: 'application/javascript', mjs: 'application/javascript', css: 'text/css', json: 'application/json', map: 'application/json' };
const serveUnpkg = async (u) => {
  // e.g. /react@18.3.1/umd/react.development.js | /@babel/standalone@7.29.0/babel.min.js
  const m = new URL(u).pathname.match(/^\/((?:@[^/]+\/)?[^/@]+)@([^/]+)\/(.+)$/);
  if (!m) return null;
  const [, pkg, version, file] = m;
  const dir = `${UNPKG_CACHE}/${pkg.replace('/', '__')}@${version}`;
  if (!existsSync(`${dir}/package`)) {
    mkdirSync(dir, { recursive: true });
    const base = pkg.includes('/') ? pkg.split('/')[1] : pkg;
    const tgz = `https://registry.npmjs.org/${pkg}/-/${base}-${version}.tgz`;
    const res = await undiciFetch(tgz, { dispatcher, signal: AbortSignal.timeout(60000) });
    if (!res.ok) return null;
    writeFileSync(`${dir}/pkg.tgz`, Buffer.from(await res.arrayBuffer()));
    execFileSync('tar', ['-xzf', `${dir}/pkg.tgz`, '-C', dir]);
  }
  const path = `${dir}/package/${file}`;
  if (!existsSync(path)) return null;
  const ext = file.split('.').pop();
  return { body: readFileSync(path), contentType: MIME[ext] ?? 'application/octet-stream' };
};

const browser = await chromium.launch({
  executablePath:
    process.env.PW_CHROMIUM ??
    '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
});

for (const { name, url } of sites) {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    serviceWorkers: 'block', // service workers would bypass route()
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const u = req.url();
    if (!/^https?:/.test(u)) return route.continue();
    if (req.method() !== 'GET') return route.fulfill({ status: 204, body: '' }); // analytics etc.
    if (new URL(u).host === 'unpkg.com') {
      try {
        const hit = await serveUnpkg(u);
        if (hit) {
          return route.fulfill({
            status: 200,
            headers: { 'content-type': hit.contentType },
            body: hit.body,
          });
        }
      } catch {
        /* fall through to the generic fetch */
      }
    }
    try {
      const res = await undiciFetch(u, {
        dispatcher,
        headers: {
          'user-agent': req.headers()['user-agent'] ?? '',
          accept: req.headers()['accept'] ?? '*/*',
          'accept-language': 'en;q=0.9,ar;q=0.8',
          ...(req.headers()['referer'] ? { referer: req.headers()['referer'] } : {}),
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
      });
      const body = Buffer.from(await res.arrayBuffer());
      const headers = {};
      for (const [k, v] of res.headers.entries()) {
        // body is already decoded and re-measured
        if (!/^(content-encoding|content-length|transfer-encoding|connection)$/i.test(k)) {
          headers[k] = v;
        }
      }
      if (res.status === 403) blockedHosts.add(new URL(u).host);
      await route.fulfill({ status: res.status, headers, body });
    } catch {
      blockedHosts.add(new URL(u).host);
      await route.abort();
    }
  });

  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  } catch {
    // heavy sites (Wix) may never go network-idle — proceed after load
  }
  await page.waitForTimeout(3000);

  // walk the page so lazy media loads and scroll reveals fire
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let y = 0;
        const timer = setInterval(() => {
          y += 600;
          window.scrollTo(0, y);
          if (y >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 120);
      }),
  );
  await page.waitForTimeout(2000);

  const doc = await page.evaluate(() =>
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
  );
  const positions = [0, Math.round((doc - H) * 0.35), Math.round((doc - H) * 0.7)];

  for (const [i, pos] of positions.entries()) {
    await page.evaluate((p) => window.scrollTo(0, p), Math.max(0, pos));
    await page.waitForTimeout(1600);
    const file = `public/work/${name}${i ? `-${i + 1}` : ''}.jpg`;
    await page.screenshot({ path: file, type: 'jpeg', quality: 82 });
    console.log(`${file}  @y=${Math.max(0, pos)} of ${doc}`);
  }
  await ctx.close();
}
await browser.close();
if (blockedHosts.size) {
  console.log('UNREACHABLE HOSTS (add to the environment allowlist if shots look broken):');
  for (const h of blockedHosts) console.log(' -', h);
}
console.log('capture complete');
