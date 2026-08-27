import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import { Locale } from '../../testConfig';
import { validSignUpData } from '@data/test-data.factory';

/**
 * Shape confirmed by capturing a real POST /api/accounts call from this
 * signup form (only the fields this suite asserts on are declared).
 */
interface AccountCreationResponseBody {
  account: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    region: string;
    preferredLanguage: string;
    leadDistributeConsentAgreement: boolean;
    password?: string;
  };
  token: {
    accessToken: string;
    tokenType: string;
  };
}

const LOCALES: Locale[] = ['en', 'fr'];

// One account-creating test per locale: the QA signup endpoint throttles
// rapid repeat requests from the same IP (see README "Known environment
// behavior"), so the request-body and response-body assertions are both
// made against the single POST /api/accounts call this test triggers,
// rather than creating a second account just to re-check the request.
for (const locale of LOCALES) {
  test.describe(
    `Signup - account creation API @${locale}`,
    { tag: [`@${locale}`, '@API', '@Mutating'] },
    () => {
      test.use({ locale });

      test('Verify POST /api/accounts returns 201 with a request/response that match the submitted form data', async ({
        signUpPage,
        apiActions,
      }) => {
        const data = validSignUpData({ consent: true });

        await test.step(`Navigate to signup page and fill the form`, async () => {
          await signUpPage.navigateToSignUp();
          await signUpPage.fillSignUpForm(data);
        });

        const response = await test.step(`Submit and capture the account-creation API call`, () =>
          apiActions.captureResponse('/api/accounts', () => signUpPage.submit(), {
            method: 'POST',
            timeout: 20_000,
          }));

        await test.step(`Verify the response status is 201`, async () => {
          expect(response.status()).toBe(201);
        });

        await test.step(`Verify the request body matches the submitted form data`, async () => {
          const requestBody = JSON.parse(response.request().postData() ?? '{}');
          expect(requestBody.firstName).toBe(data.firstName);
          expect(requestBody.lastName).toBe(data.lastName);
          expect(requestBody.email).toBe(data.email);
          expect(requestBody.phone).toBe(`+1${data.phone}`);
          expect(requestBody.region).toBe(data.province);
          expect(requestBody.language).toBe(locale);
          expect(requestBody.leadDistributeConsentAgreement).toBe(true);
        });

        await test.step(`Verify the response body matches the submitted form data`, async () => {
          const body = await apiActions.json<AccountCreationResponseBody>(response);
          expect(body.account.firstName).toBe(data.firstName);
          expect(body.account.lastName).toBe(data.lastName);
          expect(body.account.email).toBe(data.email);
          expect(body.account.phone).toBe(`+1${data.phone}`);
          expect(body.account.region).toBe(data.province);
          expect(body.account.preferredLanguage).toBe(locale);
          expect(body.account.leadDistributeConsentAgreement).toBe(true);

          // The password submitted in the form must never be echoed back.
          expect(body.account.password).toBeUndefined();

          expect(body.token.tokenType).toBe('Bearer');
          expect(typeof body.token.accessToken).toBe('string');
          expect(body.token.accessToken.length).toBeGreaterThan(0);
        });
      });
    },
  );
}
