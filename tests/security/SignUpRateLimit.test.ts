import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { validSignUpData } from '@data/test-data.factory';

/**
 * "Brute force" doesn't map onto a signup page the way it does a login
 * page - there's no password to guess here. The closest meaningful
 * analogue is verifying the account-creation endpoint throttles a burst
 * of rapid signups, which is exactly the anti-abuse behavior this session
 * empirically discovered while building the rest of this suite (see
 * README "Known environment behavior").
 *
 * This test is EXCLUDED from all automated/default commands because it
 * deliberately creates real accounts on the shared QA environment. Run it
 * explicitly and sparingly via `npm run test:ratelimit`.
 *
 * A timeout is deliberately NOT treated as proof of throttling: it could
 * also indicate a browser, application, DNS, or infrastructure failure. A
 * passing result requires the API to return the explicit HTTP 429 signal.
 */
test.describe(`Signup - rate limiting`, { tag: ['@RateLimit', '@Mutating', '@en'] }, () => {
  test.use({ locale: 'en' });

  test('Verify a configured signup burst receives an explicit HTTP 429 response', async ({
    signUpPage,
    apiActions,
  }) => {
    test.slow();
    const ATTEMPTS = Number(process.env.RATE_LIMIT_ATTEMPTS ?? 3);
    const statuses: number[] = [];

    for (let i = 0; i < ATTEMPTS; i++) {
      await test.step(`Attempt ${i + 1} of ${ATTEMPTS}`, async () => {
        await signUpPage.navigateToSignUp();
        await signUpPage.fillSignUpForm(validSignUpData());
        const response = await apiActions.captureResponse(
          '/api/accounts',
          () => signUpPage.submit(),
          {
            method: 'POST',
            timeout: 20_000,
          },
        );
        statuses.push(response.status());
      });

      if (statuses.at(-1) === 429) break;
    }

    test.info().annotations.push({ type: 'burst-results', description: JSON.stringify(statuses) });

    expect(
      statuses,
      `expected an explicit HTTP 429 response within ${ATTEMPTS} attempts; got ${JSON.stringify(statuses)}`,
    ).toContain(429);
  });
});
