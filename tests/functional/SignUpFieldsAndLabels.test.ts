import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { Locale } from '../../testConfig';

const LOCALES: Locale[] = ['en', 'fr'];

for (const locale of LOCALES) {
  test.describe(`Signup - fields & labels @${locale}`, { tag: [`@${locale}`] }, () => {
    test.use({ locale });

    test.beforeEach(async ({ signUpPage }) => {
      await signUpPage.navigateToSignUp();
    });

    test('Verify the heading and every expected field render', async ({ signUpPage }) => {
      await expect(signUpPage.HEADING).toBeVisible();
      await expect(signUpPage.FIRST_NAME_INPUT).toBeVisible();
      await expect(signUpPage.LAST_NAME_INPUT).toBeVisible();
      await expect(signUpPage.PHONE_INPUT).toBeVisible();
      await expect(signUpPage.PROVINCE_SELECT).toBeVisible();
      await expect(signUpPage.EMAIL_INPUT).toBeVisible();
      await expect(signUpPage.PASSWORD_INPUT).toBeVisible();
      await expect(signUpPage.CONFIRM_PASSWORD_INPUT).toBeVisible();
      await expect(signUpPage.CONSENT_CHECKBOX).toBeVisible();
      await expect(signUpPage.SUBMIT_BUTTON).toBeVisible();
      await expect(signUpPage.LOGIN_LINK).toBeVisible();
    });

    test('Verify field input types are correct', async ({ signUpPage }) => {
      await expect(signUpPage.FIRST_NAME_INPUT).toHaveAttribute('type', 'text');
      await expect(signUpPage.LAST_NAME_INPUT).toHaveAttribute('type', 'text');
      await expect(signUpPage.PHONE_INPUT).toHaveAttribute('type', 'tel');
      await expect(signUpPage.PASSWORD_INPUT).toHaveAttribute('type', 'password');
      await expect(signUpPage.CONFIRM_PASSWORD_INPUT).toHaveAttribute('type', 'password');
      await expect(signUpPage.CONSENT_CHECKBOX).toHaveAttribute('type', 'checkbox');
    });

    test('Verify the email field uses native email semantics', async ({ signUpPage }) => {
      test.fail(true, 'BUG-003: the live app currently renders type="text"');
      await expect(signUpPage.EMAIL_INPUT).toHaveAttribute('type', 'email');
    });

    test('Verify the marketing-consent checkbox is optional and unchecked by default', async ({
      signUpPage,
    }) => {
      await expect(signUpPage.CONSENT_CHECKBOX).not.toBeChecked();
      await expect(signUpPage.CONSENT_CHECKBOX).not.toHaveAttribute('required', '');
    });

    test('Verify static copy (password hint, consent text) matches the expected locale text', async ({
      signUpPage,
    }) => {
      await expect(signUpPage.PASSWORD_HINT).toBeVisible();
      await expect(signUpPage.CONSENT_LABEL).toBeVisible();
    });

    test('Verify submit button and login link show the expected localized text', async ({
      signUpPage,
      copy,
    }) => {
      await expect(signUpPage.SUBMIT_BUTTON).toHaveText(copy.submitButton);
      await expect(signUpPage.LOGIN_LINK).toHaveText(copy.loginLinkText);
    });

    test('Verify the province dropdown lists every expected option with the localized label', async ({
      signUpPage,
      copy,
    }) => {
      for (const [code, label] of Object.entries(copy.provinceOptions)) {
        await expect(signUpPage.PROVINCE_SELECT.locator(`option[value="${code}"]`)).toHaveText(
          label,
        );
      }
    });

    test('Verify the Terms of Service and Privacy Policy links point to a real, working page', async ({
      signUpPage,
      copy,
      request,
    }) => {
      await test.step(`Verify both links are visible with the expected href and open in a new tab`, async () => {
        await expect(signUpPage.TERMS_LINK).toBeVisible();
        await expect(signUpPage.TERMS_LINK).toHaveAttribute('href', copy.termsLink.href);
        await expect(signUpPage.TERMS_LINK).toHaveAttribute('target', '_blank');

        await expect(signUpPage.PRIVACY_LINK).toBeVisible();
        await expect(signUpPage.PRIVACY_LINK).toHaveAttribute('href', copy.privacyLink.href);
        await expect(signUpPage.PRIVACY_LINK).toHaveAttribute('target', '_blank');
      });

      await test.step(`Verify both URLs actually resolve instead of being dead links`, async () => {
        for (const url of [copy.termsLink.href, copy.privacyLink.href]) {
          const response = await request.get(url);
          expect(
            response.ok(),
            `${url} should resolve successfully, got ${response.status()}`,
          ).toBe(true);
        }
      });
    });

    test('Verify the company logo is visible, links to home, and loads successfully', async ({
      signUpPage,
    }) => {
      await test.step(`Verify the logo is visible and wrapped in a link to home`, async () => {
        await expect(signUpPage.LOGO).toBeVisible();
        await expect(signUpPage.LOGO_LINK).toHaveAttribute('href', '/');
      });

      await test.step(`Verify the image actually rendered rather than being a broken link`, async () => {
        const src = await signUpPage.LOGO.getAttribute('src');
        expect(src, 'logo should have a non-empty src').toBeTruthy();

        // The logo can take a moment to finish loading after it's already
        // visible in the DOM, so poll rather than reading naturalWidth once.
        await expect
          .poll(() => signUpPage.LOGO.evaluate((img) => (img as HTMLImageElement).naturalWidth), {
            message: 'logo image should decode real pixel data, not be broken',
          })
          .toBeGreaterThan(0);
      });
    });
  });
}
