import type { Dict } from './types';
import { en } from './en';
import { ar } from './ar';

export type Locale = 'en' | 'ar';

export interface LocaleInfo {
  lang: Locale;
  dir: 'ltr' | 'rtl';
  /** Wordmark per guideline §1 — the other mark never appears in the header. */
  wordmark: string;
  ogLocale: string;
  htmlPath: `/${Locale}/`;
}

export const locales: Record<Locale, LocaleInfo> = {
  en: { lang: 'en', dir: 'ltr', wordmark: 'YASIR_', ogLocale: 'en_US', htmlPath: '/en/' },
  // ياســر — kashida (U+0640 ×2) between س and ر; trailing _ per owner
  // (renders at the inline-end — the left — in RTL)
  ar: { lang: 'ar', dir: 'rtl', wordmark: 'ياســر _', ogLocale: 'ar_SA', htmlPath: '/ar/' },
};

export const dicts: Record<Locale, Dict> = { en, ar };

export const altLocale = (l: Locale): Locale => (l === 'en' ? 'ar' : 'en');

/** Contact address — TODO(yasir): swap to a domain mailbox once the
 *  production domain (open intake item) is confirmed. */
export const CONTACT_EMAIL = 'yaserkh.09@gmail.com';
