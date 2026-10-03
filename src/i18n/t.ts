import { locale } from './locale';
import fr from './locales/fr.json';
import type { TranslationKey, TranslationParams } from './types';

const messages: Record<string, string> = fr;

const pluralRules = new Intl.PluralRules(locale);

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!Object.hasOwn(params, key)) return `{{${key}}}`;
    return String(params[key]);
  });
}

function lookup(key: string): string | undefined {
  return Object.hasOwn(messages, key) ? messages[key] : undefined;
}

function resolveTemplate(key: TranslationKey, params?: TranslationParams): string {
  if (params && typeof params.count === 'number') {
    const category = pluralRules.select(params.count);
    const template = lookup(`${key}.${category}`) ?? lookup(`${key}.other`) ?? lookup(key);
    if (template !== undefined) return template;
  }

  const template = lookup(key);
  if (template !== undefined) return template;

  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing key: ${key}`);
  }
  return key;
}

export function t(key: TranslationKey, params?: TranslationParams): string {
  return interpolate(resolveTemplate(key, params), params);
}
