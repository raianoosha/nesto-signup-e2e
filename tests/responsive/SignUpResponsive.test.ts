import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { Locale } from '../../testConfig';

const LOCALES: Locale[] = ['en', 'fr'];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

/**
 * Lightweight responsive smoke checks, not full visual regression testing -
 * no screenshot/pixel diffing, no baseline images to maintain. This confirms
 * the layout doesn't force horizontal scrolling and every field stays
 * genuinely visible at a few common breakpoints. Never submits the form, so
 * - like the accessibility suite - it's safe to run as often as needed.
 */
for (const locale of LOCALES) {
  test.describe(`Signup - responsive @${locale}`, { tag: [`@${locale}`] }, () => {
    test.use({ locale });

    for (const viewport of VIEWPORTS) {
      test(`Verify the signup form holds up at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
        signUpPage,
      }) => {
        await test.step(`Set the viewport and navigate to the signup page`, async () => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await signUpPage.navigateToSignUp();
        });

        await test.step(`Verify no horizontal overflow is introduced`, async () => {
          const { scrollWidth, clientWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(
            scrollWidth,
            `content is ${scrollWidth}px wide but the viewport is only ${clientWidth}px - something is overflowing horizontally`,
          ).toBeLessThanOrEqual(clientWidth);
        });

        await test.step(`Verify every field and the submit button are still visible`, async () => {
          for (const field of [
            signUpPage.FIRST_NAME_INPUT,
            signUpPage.LAST_NAME_INPUT,
            signUpPage.PHONE_INPUT,
            signUpPage.PROVINCE_SELECT,
            signUpPage.EMAIL_INPUT,
            signUpPage.PASSWORD_INPUT,
            signUpPage.CONFIRM_PASSWORD_INPUT,
            signUpPage.CONSENT_CHECKBOX,
            signUpPage.SUBMIT_BUTTON,
          ]) {
            await expect(field).toBeVisible();
          }
        });
      });
    }
  });
}
