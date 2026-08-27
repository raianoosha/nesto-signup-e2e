import 'dotenv/config';

export type Locale = 'en' | 'fr';

export const testConfig = {
  qa: process.env.BASE_URL ?? 'https://app.qa.nesto.ca',
  defaultLocale: (process.env.DEFAULT_LOCALE as Locale) ?? 'en',
};
