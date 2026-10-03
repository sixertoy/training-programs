import type fr from './locales/fr.json';

export type MessageKey = keyof typeof fr;

type PluralSuffix = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export type PluralBase = {
  [K in MessageKey]: K extends `${infer Base}.${PluralSuffix}` ? Base : never;
}[MessageKey];

export type TranslationKey = MessageKey | PluralBase;

export type TranslationParams = Record<string, string | number>;
