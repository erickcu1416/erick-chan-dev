import es from './translations/es.json';
import en from './translations/en.json';

export const languages = {
  es: 'Español',
  en: 'English',
};

export const defaultLang = 'es';

export type Locale = keyof typeof languages;

const translations = { es, en } as const;

type TranslationKeys = typeof es;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof value === 'string' ? value : path;
}

export function t(key: string, locale: Locale = defaultLang): string {
  const translation = translations[locale];
  return getNestedValue(translation as unknown as Record<string, unknown>, key);
}

export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.replace(/^\/(es|en)/, '');
  return `/${locale}${cleanPath || '/'}`;
}

export function getCurrentLocale(pathname: string): Locale {
  const [, lang] = pathname.split('/');
  if (lang === 'en' || lang === 'es') {
    return lang;
  }
  return defaultLang;
}

export function getAlternateLinks(pathname: string): Array<{ locale: Locale; path: string }> {
  const currentLocale = getCurrentLocale(pathname);
  const basePath = pathname.replace(/^\/(es|en)/, '');

  return Object.keys(languages).map((locale) => ({
    locale: locale as Locale,
    path: `/${locale}${basePath || '/'}`,
  }));
}
