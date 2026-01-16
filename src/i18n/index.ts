import es from './translations/es.json';
import en from './translations/en.json';

export const languages = {
  es: 'Español',
  en: 'English',
};

export const defaultLang = 'es';

export type Locale = keyof typeof languages;

export const routeMap: Record<string, { es: string; en: string }> = {
  home: { es: '/', en: '/' },
  services: { es: '/servicios', en: '/services' },
  useCases: { es: '/casos-de-uso', en: '/use-cases' },
  about: { es: '/nosotros', en: '/about' },
  contact: { es: '/contacto', en: '/contact' },
};

const translations = { es, en } as const;

type TranslationKeys = typeof es;

function getNestedValue(obj: Record<string, unknown>, path: string): string | string[] {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  // Return arrays and strings, fallback to path
  if (typeof value === 'string' || Array.isArray(value)) {
    return value;
  }
  return path;
}

export function t(key: string, locale: Locale = defaultLang): string | string[] {
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

export function translateRoute(path: string, targetLocale: Locale): string {
  // Remove leading/trailing slashes for comparison
  const cleanPath = path.replace(/^\/|\/$/g, '');

  // Home route
  if (cleanPath === '') return '/';

  // Find matching route
  for (const [key, routes] of Object.entries(routeMap)) {
    if (routes.es === `/${cleanPath}` || routes.en === `/${cleanPath}`) {
      return routes[targetLocale];
    }
  }

  // Fallback: return original path
  return `/${cleanPath}`;
}

export function getAlternateLinks(pathname: string): Array<{ locale: Locale; path: string }> {
  const currentLocale = getCurrentLocale(pathname);
  const basePath = pathname.replace(/^\/(es|en)/, '');

  return Object.keys(languages).map((locale) => ({
    locale: locale as Locale,
    path: `/${locale}${basePath || '/'}`,
  }));
}
