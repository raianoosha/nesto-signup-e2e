import { test as baseTest } from '@playwright/test';
import { SignUpPage } from '@pages/SignUpPage';
import { WebActions } from '@lib/WebActions';
import { APIActions } from '@lib/APIActions';
import { locales, LocaleCopy } from '@data/locales';
import AxeBuilder from '@axe-core/playwright';
import { Locale, testConfig } from '../testConfig';

const test = baseTest.extend<{
  locale: Locale;
  copy: LocaleCopy;
  webActions: WebActions;
  apiActions: APIActions;
  signUpPage: SignUpPage;
  makeAxeBuilder: AxeBuilder;
}>({
  // eslint-disable-next-line no-empty-pattern
  locale: async ({}, use) => {
    await use(testConfig.defaultLocale);
  },
  copy: async ({ locale }, use) => {
    await use(locales[locale]);
  },
  webActions: async ({ page, context }, use) => {
    await use(new WebActions(page, context));
  },
  apiActions: async ({ page }, use) => {
    await use(new APIActions(page));
  },
  signUpPage: async ({ page, context, copy }, use) => {
    await use(new SignUpPage(page, context, copy));
  },
  makeAxeBuilder: async ({ page }, use) => {
    await use(new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']));
  },
});

export default test;
