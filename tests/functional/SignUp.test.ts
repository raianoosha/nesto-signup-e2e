import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { validSignUpData } from '@data/test-data.factory';

/**
 * Deliberately a single account-creating test per locale: the QA signup
 * endpoint (POST /api/accounts) throttles rapid repeat requests from the
 * same IP (see README "Known environment behavior"), so this suite keeps
 * the number of accounts it creates to the minimum needed to prove the
 * happy path actually works end-to-end. Consent-flag correctness is
 * asserted against the real API payload in tests/api/SignUpAccounts.test.ts
 * (leadDistributeConsentAgreement), and every province's selectability is
 * covered without submitting in SignUpFieldsAndLabels.test.ts.
 */
test.describe(`Signup - happy path (English)`, { tag: ['@Smoke', '@en', '@Mutating'] }, () => {
  test.use({ locale: 'en' });

  test(`Verify Signup - happy path (English)`, async ({ signUpPage, page }) => {
    await test.step(`Navigate to signup page`, async () => {
      await signUpPage.navigateToSignUp();
      await expect(signUpPage.HEADING).toBeVisible();
    });

    await test.step(`Fill the signup form with valid data and consent checked`, async () => {
      await signUpPage.fillSignUpForm(validSignUpData({ province: 'QC', consent: true }));
      await expect(signUpPage.CONSENT_CHECKBOX).toBeChecked();
    });

    await test.step(`Submit and verify the account is created`, async () => {
      await signUpPage.submit();
      // Successful signup redirects away from /signup; the app also loads
      // several third-party analytics beacons on submit, so give this
      // extra room rather than a tight timeout.
      await page.waitForURL((url) => !url.pathname.includes('/signup'), { timeout: 20_000 });
    });
  });
});

test.describe(`Signup - happy path (French)`, { tag: ['@Smoke', '@fr', '@Mutating'] }, () => {
  test.use({ locale: 'fr' });

  test(`Verify Signup - happy path (French)`, async ({ signUpPage, page }) => {
    await test.step(`Navigate to signup page`, async () => {
      await signUpPage.navigateToSignUp();
      await expect(signUpPage.HEADING).toBeVisible();
    });

    await test.step(`Fill the signup form with valid data and consent checked`, async () => {
      await signUpPage.fillSignUpForm(validSignUpData({ province: 'QC', consent: true }));
      await expect(signUpPage.CONSENT_CHECKBOX).toBeChecked();
    });

    await test.step(`Submit and verify the account is created`, async () => {
      await signUpPage.submit();
      await page.waitForURL((url) => !url.pathname.includes('/signup'), { timeout: 20_000 });
    });
  });
});
