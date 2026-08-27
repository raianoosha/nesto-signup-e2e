import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { sqlInjectionPayloads, xssPayloads } from '@data/security-payloads';
import { validSignUpData } from '@data/test-data.factory';

/**
 * IMPORTANT SCOPE NOTE - what this file can and can't prove:
 *
 * This is UI-boundary security *regression* testing via Playwright, not a
 * penetration test. It's a genuinely useful, standard thing to have in a
 * web E2E suite, but it has real limits worth being explicit about:
 *
 * - "SQL injection" here means: submit classic SQLi strings through the
 *   UI and check the app doesn't crash, doesn't leak a DB error, and
 *   doesn't behave as if the payload executed. It CANNOT confirm the
 *   backend uses parameterized queries - that requires backend code
 *   review, SAST, or a real DAST/sqlmap-style tool against the API
 *   directly. A pass here means "the web app handled it gracefully," not
 *   "the database is safe."
 * - "XSS" here means: check the payload isn't reflected as executable
 *   markup in the DOM after submission. It's a reasonable, real check for
 *   a UI test.
 * - Things intentionally NOT attempted here because they don't fit a UI
 *   E2E framework's natural scope (would need direct API/backend
 *   manipulation and knowledge of internals we don't have): CSRF token
 *   tampering, session fixation, IDOR, auth bypass.
 * - Rate-limit/"brute force" verification lives in a separate file
 *   (SignUpRateLimit.test.ts) since it deliberately creates several
 *   accounts in quick succession - see that file and the README's "Known
 *   environment behavior" note before running it.
 */
test.describe(`Signup - security (input handling) @en`, { tag: ['@en', '@Security'] }, () => {
  test.use({ locale: 'en' });

  test('Verify SQL injection / XSS payloads in strictly-validated fields are rejected without creating an account', async ({
    signUpPage,
  }) => {
    await test.step(`Navigate to signup page`, async () => {
      await signUpPage.navigateToSignUp();
    });

    for (const payload of [...sqlInjectionPayloads, ...xssPayloads]) {
      await test.step(`Submit with email set to a raw payload: ${payload}`, async () => {
        await signUpPage.fillSignUpForm(validSignUpData({ email: payload }));
        await signUpPage.submit();
        // Email format validation should reject this before any API call -
        // same "Invalid email" path already proven in SignUpValidation.test.ts.
        await expect(signUpPage.EMAIL_INPUT).toHaveAttribute('aria-invalid', 'true');
      });
    }
  });

  // Deliberately ONE account-creating submission for both SQLi and XSS
  // coverage together (first name / last name have no format restriction,
  // so a payload placed there can reach the API) - see README "Known
  // environment behavior" for why this suite minimizes new accounts.
  test(
    'Verify SQL injection and XSS payloads in free-text name fields are handled safely end-to-end',
    {
      tag: '@Mutating',
    },
    async ({ signUpPage, apiActions, page }) => {
      const data = validSignUpData({
        firstName: sqlInjectionPayloads[1], // `'; DROP TABLE users; --`
        lastName: xssPayloads[0], // `<script>alert('xss')</script>`
      });

      await test.step(`Navigate to signup page and fill the form with injection payloads`, async () => {
        await signUpPage.navigateToSignUp();
        await signUpPage.fillSignUpForm(data);
      });

      const response = await test.step(`Submit and capture the account-creation API call`, () =>
        apiActions.captureResponse('/api/accounts', () => signUpPage.submit(), {
          method: 'POST',
          timeout: 20_000,
        }));

      await test.step(`Verify the app didn't crash and didn't leak a database error`, async () => {
        expect(response.status(), 'expected a normal HTTP status, not a server error').toBeLessThan(
          500,
        );
        const bodyText = await response.text();
        expect(bodyText).not.toMatch(/sql syntax|sqlstate|ORA-\d{5}|pg_query|mysql_fetch/i);
      });

      if (response.status() === 201) {
        await test.step(`Verify the payload was stored as literal text, not executed`, async () => {
          const body = await apiActions.json<{ account: { firstName: string; lastName: string } }>(
            response,
          );
          expect(body.account.firstName).toBe(data.firstName);
          expect(body.account.lastName).toBe(data.lastName);
        });

        await test.step(`Verify the XSS payload never renders as live markup on the resulting page`, async () => {
          await page.waitForURL((url) => !url.pathname.includes('/signup'), { timeout: 20_000 });
          const scriptTags = await page.locator('script:has-text("alert(\'xss\')")').count();
          expect(
            scriptTags,
            'the injected <script> payload must never execute as real markup',
          ).toBe(0);
        });
      }
    },
  );

  test(
    'Verify the account-creation response never exposes the submitted password',
    {
      tag: '@Mutating',
    },
    async ({ signUpPage, apiActions }) => {
      const data = validSignUpData();

      await test.step(`Navigate to signup page and fill the form`, async () => {
        await signUpPage.navigateToSignUp();
        await signUpPage.fillSignUpForm(data);
      });

      const response = await test.step(`Submit and capture the account-creation API call`, () =>
        apiActions.captureResponse('/api/accounts', () => signUpPage.submit(), {
          method: 'POST',
          timeout: 20_000,
        }));

      await test.step(`Verify the response body and headers never contain the raw password`, async () => {
        expect(response.status()).toBe(201);
        const bodyText = await response.text();
        expect(bodyText).not.toContain(data.password);
        expect(JSON.stringify(response.headers())).not.toContain(data.password);
        expect(response.url()).not.toContain(data.password);
      });
    },
  );

  test('Verify standard security response headers are present on the signup page', async ({
    page,
  }) => {
    const response = await test.step(`Load the signup page`, () => page.goto('/en/signup'));

    await test.step(`Verify headers confirmed present today are still present (regression guard)`, async () => {
      expect(response).not.toBeNull();
      const headers = response!.headers();
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['strict-transport-security']).toContain('max-age=');
      expect(headers['x-frame-options']).toContain('DENY');
    });
  });

  test('Verify X-Frame-Options has one valid DENY value', async ({ page }) => {
    test.fail(true, 'BUG-005: the live response currently duplicates the DENY value');
    const response = await page.goto('/en/signup');

    expect(response).not.toBeNull();
    expect(response!.headers()['x-frame-options']).toBe('DENY');
  });

  test('Verify the signup page provides a Content-Security-Policy', async ({ page }) => {
    test.fail(true, 'BUG-006: the live response currently has no CSP header');
    const response = await page.goto('/en/signup');

    expect(response).not.toBeNull();
    expect(response!.headers()['content-security-policy']).toBeTruthy();
  });
});
