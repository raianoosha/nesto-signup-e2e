import test from '@lib/BaseTest';
import { expect } from '@playwright/test';
import type AxeBuilder from '@axe-core/playwright';
import { Locale } from '../../testConfig';

const LOCALES: Locale[] = ['en', 'fr'];

/**
 * None of these tests submit the form, so they never hit the throttled
 * POST /api/accounts endpoint (see README "Known environment behavior") -
 * this whole spec is safe to run as often as needed.
 */
for (const locale of LOCALES) {
  test.describe(`Signup - accessibility @${locale}`, { tag: [`@${locale}`] }, () => {
    test.use({ locale });

    test.beforeEach(async ({ signUpPage }) => {
      await signUpPage.navigateToSignUp();
    });

    test('Verify the page has no automatically detectable WCAG 2.0/2.1 A/AA violations', async ({
      makeAxeBuilder,
    }) => {
      const results = await test.step(`Run the axe-core accessibility scan`, () =>
        makeAxeBuilder.analyze());

      await test.step(`Attach the full report for debugging`, async () => {
        await test.info().attach('axe-results', {
          body: JSON.stringify(results.violations, null, 2),
          contentType: 'application/json',
        });
      });

      await test.step(`Verify there are no violations`, async () => {
        expect(results.violations, formatViolations(results.violations)).toEqual([]);
      });
    });

    test('Verify every form field has an accessible name', async ({ signUpPage }) => {
      for (const field of [
        signUpPage.FIRST_NAME_INPUT,
        signUpPage.LAST_NAME_INPUT,
        signUpPage.PHONE_INPUT,
        signUpPage.PROVINCE_SELECT,
        signUpPage.EMAIL_INPUT,
        signUpPage.PASSWORD_INPUT,
        signUpPage.CONFIRM_PASSWORD_INPUT,
        signUpPage.CONSENT_CHECKBOX,
      ]) {
        await expect(field).toHaveAccessibleName(/.+/);
      }
    });

    test('Verify the whole form is reachable and operable by keyboard alone', async ({
      page,
      signUpPage,
    }) => {
      await test.step(`Focus the first field`, async () => {
        await signUpPage.FIRST_NAME_INPUT.focus();
        await expect(signUpPage.FIRST_NAME_INPUT).toBeFocused();
      });

      // Fields must be reachable in this exact order. A small bounded number
      // of unrelated stops is allowed for legitimate composite controls (for
      // example, the phone country selector), but focus must never wrap or
      // advance to a later expected field before the current one.
      const tabOrder = [
        signUpPage.LAST_NAME_INPUT,
        signUpPage.PHONE_INPUT,
        signUpPage.PROVINCE_SELECT,
        signUpPage.EMAIL_INPUT,
        signUpPage.PASSWORD_INPUT,
        signUpPage.CONFIRM_PASSWORD_INPUT,
        signUpPage.CONSENT_CHECKBOX,
        signUpPage.SUBMIT_BUTTON,
      ];
      const maxTabStopsPerField = 4;

      await test.step(`Tab through every field in order`, async () => {
        for (const [expectedIndex, field] of tabOrder.entries()) {
          let found = false;

          for (let tabStop = 0; tabStop < maxTabStopsPerField; tabStop++) {
            await page.keyboard.press('Tab');

            if (await signUpPage.FIRST_NAME_INPUT.evaluate((el) => el === document.activeElement)) {
              throw new Error(
                'Keyboard focus wrapped to the first field before the expected order completed',
              );
            }

            const actualIndex = await (async () => {
              for (const [index, candidate] of tabOrder.entries()) {
                if (await candidate.evaluate((el) => el === document.activeElement)) return index;
              }
              return -1;
            })();

            if (actualIndex === -1) continue;

            expect(
              actualIndex,
              `Unexpected focus before ${(await field.getAttribute('name')) ?? 'the expected field'}`,
            ).toBe(expectedIndex);
            found = true;
            break;
          }

          expect(found, `Expected field at tab-order index ${expectedIndex} was not reached`).toBe(
            true,
          );
        }
      });
    });
  });
}

function formatViolations(
  violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
): string {
  if (violations.length === 0) return 'no violations';
  return violations
    .map((v) => `${v.id} (${v.help}) - ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    .join('\n');
}
