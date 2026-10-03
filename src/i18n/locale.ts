import type { Locale } from 'date-fns';
import { fr as dateFnsFr } from 'date-fns/locale';

export const locale = 'fr' as const;

export type AppLocale = typeof locale;

const DATE_FNS_LOCALES: Record<AppLocale, Locale> = {
  fr: dateFnsFr,
};

export const dateFnsLocale: Locale = DATE_FNS_LOCALES[locale];
