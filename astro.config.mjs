// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Canonical/hreflang/OG URLs derive from this. On Netlify it's taken from
  // the build-time URL env var automatically; the placeholder is only used
  // for local builds. TODO(yasir): swap to the real domain once chosen.
  site: process.env.URL || 'https://yasir-portfolio.example',
  trailingSlash: 'always',
  build: {
    // Inline all CSS: one less render-blocking request, faster FCP/LCP.
    inlineStylesheets: 'always',
  },
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'ar',
    // our own src/pages/index.astro handles the root redirect (to /ar/)
    // with hreflang links and an instant JS replace — keep Astro's
    // auto-generated redirect page out of the build
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
