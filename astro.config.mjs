// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // TODO(yasir): production domain is an open intake item — set it here
  // before launch; canonical + hreflang URLs derive from it.
  site: 'https://yasir-portfolio.example',
  trailingSlash: 'always',
  build: {
    // Inline all CSS: one less render-blocking request, faster FCP/LCP.
    inlineStylesheets: 'always',
  },
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true },
  },
});
