import test from '@lib/BaseTest';
import { expect, type Page } from '@playwright/test';
import { Locale } from '../../testConfig';
import {
  invalidEmails,
  invalidPasswords,
  invalidPhones,
  validSignUpData,
} from '@data/test-data.factory';

const LOCALES: Locale[] = ['en', 'fr'];

for (const locale of LOCALES) {
  test.describe(`Signup - negative & validation @${locale}`, { tag: [`@${locale}`] }, () => {
    test.use({ locale });

    test.beforeEach(async ({ signUpPage }) => {
      await signUpPage.navigateToSignUp();
    });

    test('Verify submitting a completely empty form surfaces per-field errors', async ({
      signUpPage,
      page,
      copy,
    }) => {
      await expectNoAccountCreationRequest(page, async () => {
        await test.step(`Submit the form with no data entered`, async () => {
          await signUpPage.submit();
        });

        await test.step(`Verify required/invalid field errors are shown`, async () => {
          await expect(signUpPage.FIRST_NAME_INPUT).toHaveAttribute('aria-invalid', 'true');
          await expect(signUpPage.LAST_NAME_INPUT).toHaveAttribute('aria-invalid', 'true');
          await expect(signUpPage.PHONE_INPUT).toHaveAttribute('aria-invalid', 'true');
          await expect(signUpPage.EMAIL_INPUT).toHaveAttribute('aria-invalid', 'true');
          await expect(signUpPage.PASSWORD_INPUT).toHaveAttribute('aria-invalid', 'true');

          expect(await signUpPage.errorFor(signUpPage.FIRST_NAME_INPUT)).toBe(copy.errors.required);
          expect(await signUpPage.errorFor(signUpPage.LAST_NAME_INPUT)).toBe(copy.errors.required);
          expect(await signUpPage.errorFor(signUpPage.PHONE_INPUT)).toBe(copy.errors.invalidValue);
          expect(await signUpPage.errorFor(signUpPage.EMAIL_INPUT)).toBe(copy.errors.invalidEmail);
          expect(await signUpPage.errorFor(signUpPage.PASSWORD_INPUT)).toBe(
            copy.errors.passwordTooShort,
          );
        });
      });

      await test.step(`Verify no account was created`, async () => {
        expect(page.url()).toContain('/signup');
      });
    });

    test('Verify invalid email formats are rejected client-side', async ({
      signUpPage,
      page,
      copy,
    }) => {
      for (const email of invalidEmails) {
        await expectNoAccountCreationRequest(page, async () => {
          await test.step(`Submit with invalid email "${email}"`, async () => {
            await signUpPage.fillSignUpForm(validSignUpData({ email }));
            await signUpPage.submit();
            await expect(signUpPage.EMAIL_INPUT).toHaveAttribute('aria-invalid', 'true');
            expect(await signUpPage.errorFor(signUpPage.EMAIL_INPUT)).toBe(
              copy.errors.invalidEmail,
            );
          });
        });
      }
    });

    test('Verify a password shorter than 12 characters is rejected', async ({
      signUpPage,
      page,
      copy,
    }) => {
      await expectNoAccountCreationRequest(page, async () => {
        await test.step(`Submit with a too-short password`, async () => {
          await signUpPage.fillSignUpForm(
            validSignUpData({
              password: invalidPasswords.tooShort,
              confirmPassword: invalidPasswords.tooShort,
            }),
          );
          await signUpPage.submit();
        });

        await test.step(`Verify the password field is flagged invalid`, async () => {
          await expect(signUpPage.PASSWORD_INPUT).toHaveAttribute('aria-invalid', 'true');
          expect(await signUpPage.errorFor(signUpPage.PASSWORD_INPUT)).toBe(
            copy.errors.passwordTooShort,
          );
        });
      });
    });

    // Exact wording for these violations wasn't confirmed against the live
    // app (only the "too short" message was), so assert the field is
    // flagged invalid with *some* message rather than a specific string.
    for (const [violation, password] of Object.entries(invalidPasswords)) {
      if (violation === 'tooShort') continue;
      test(`Verify a password violating "${violation}" is rejected`, async ({
        signUpPage,
        page,
      }) => {
        await expectNoAccountCreationRequest(page, async () => {
          await test.step(`Submit with a password violating "${violation}"`, async () => {
            await signUpPage.fillSignUpForm(
              validSignUpData({ password, confirmPassword: password }),
            );
            await signUpPage.submit();
          });

          await test.step(`Verify the password field is flagged invalid`, async () => {
            await expect(signUpPage.PASSWORD_INPUT).toHaveAttribute('aria-invalid', 'true');
            expect(await signUpPage.errorFor(signUpPage.PASSWORD_INPUT)).toBeTruthy();
          });
        });
      });
    }

    test('Verify mismatched password/confirm-password is rejected', async ({
      signUpPage,
      page,
      copy,
    }) => {
      await expectNoAccountCreationRequest(page, async () => {
        await test.step(`Submit with mismatched password and confirm-password`, async () => {
          await signUpPage.fillSignUpForm(
            validSignUpData({
              password: 'TestPassw0rd123',
              confirmPassword: 'DifferentPassw0rd123',
            }),
          );
          await signUpPage.submit();
        });

        await test.step(`Verify the confirm-password field is flagged invalid`, async () => {
          await expect(signUpPage.CONFIRM_PASSWORD_INPUT).toHaveAttribute('aria-invalid', 'true');
          const message = await signUpPage.errorFor(signUpPage.CONFIRM_PASSWORD_INPUT);
          if (copy.errors.passwordMismatch) {
            expect(message).toBe(copy.errors.passwordMismatch);
          } else {
            expect(message).toBeTruthy();
          }
        });
      });
    });

    test('Verify invalid phone numbers are rejected', async ({ signUpPage, page, copy }) => {
      for (const phone of invalidPhones) {
        await expectNoAccountCreationRequest(page, async () => {
          await test.step(`Submit with invalid phone "${phone}"`, async () => {
            await signUpPage.fillSignUpForm(validSignUpData({ phone }));
            await signUpPage.submit();
            await expect(signUpPage.PHONE_INPUT).toHaveAttribute('aria-invalid', 'true');
            expect(await signUpPage.errorFor(signUpPage.PHONE_INPUT)).toBe(
              copy.errors.invalidValue,
            );
          });
        });
      }
    });

    // This is the flakiest test in the suite by nature of the environment:
    // the QA account-creation endpoint throttles rapid repeat POST
    // /api/accounts calls from the same IP (see README "Known environment
    // behavior"), and this test deliberately makes two such calls back to
    // back. test.slow() + generous per-call timeouts give the throttle room
    // to clear; CI retries twice on top of that.
    test(
      'Verify signing up twice with the same email does not silently succeed a second time',
      { tag: '@Mutating' },
      async ({ signUpPage, apiActions }) => {
        test.slow();
        const data = validSignUpData();

        await test.step(`Sign up once`, async () => {
          await signUpPage.fillSignUpForm(data);
          const response = await apiActions.captureResponse(
            '/api/accounts',
            () => signUpPage.submit(),
            {
              method: 'POST',
              timeout: 30_000,
            },
          );
          expect(response.status()).toBe(201);
        });

        await test.step(`Sign up again with the same email`, async () => {
          await signUpPage.navigateToSignUp();
          await signUpPage.fillSignUpForm(data);
          const secondResponse = await apiActions.captureResponse(
            '/api/accounts',
            () => signUpPage.submit(),
            {
              method: 'POST',
              timeout: 30_000,
            },
          );
          expect(secondResponse.status()).not.toBe(201);
        });
      },
    );
  });
}

/**
 * Validation tests must prove that client-side rejection does not still send
 * an account-creation request. The route is aborted as a safety net so a
 * regression cannot create a QA account while this assertion is running.
 */
async function expectNoAccountCreationRequest(
  page: Page,
  action: () => Promise<void>,
): Promise<void> {
  const accountRequests: string[] = [];
  const accountRoute = '**/api/accounts**';

  await page.route(accountRoute, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    accountRequests.push(route.request().url());
    await route.abort();
  });

  try {
    await action();
    expect(accountRequests, 'Client-side validation sent an account-creation request').toHaveLength(
      0,
    );
  } finally {
    await page.unroute(accountRoute);
  }
}
