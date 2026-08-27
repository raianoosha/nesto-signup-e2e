# nesto-signup-e2e

Playwright and TypeScript coverage for the bilingual nesto signup page at
`{BASE_URL}/{locale}/signup`.

The suite separates repeatable, non-mutating checks from tests that create real accounts in the
shared QA environment. Pull requests run only the non-mutating group. Account creation runs on
Chromium only and must be started deliberately.

## Setup

```bash
npm ci
npx playwright install
cp .env.example .env # optional: override BASE_URL or DEFAULT_LOCALE
```

## Test commands

| Command                   | Scope                                                     |
| ------------------------- | --------------------------------------------------------- |
| `npm test`                | Non-mutating tests, both locales, all configured browsers |
| `npm run test:en`         | Non-mutating English tests                                |
| `npm run test:fr`         | Non-mutating French tests                                 |
| `npm run test:headed`     | Non-mutating tests in headed mode                         |
| `npm run test:debug`      | Non-mutating tests in Playwright Inspector                |
| `npm run test:fields`     | Field, label, and localized-copy coverage                 |
| `npm run test:negative`   | Validation coverage, excluding duplicate-account creation |
| `npm run test:a11y`       | axe-core, accessible-name, and keyboard coverage          |
| `npm run test:responsive` | Layout/overflow checks at mobile, tablet, and desktop     |
| `npm run test:security`   | Non-mutating input and response-header checks             |
| `npm run test:smoke`      | Account-creation smoke tests on Chromium                  |
| `npm run test:positive`   | Happy-path account creation on Chromium                   |
| `npm run test:api`        | UI-triggered account API contract checks on Chromium      |
| `npm run test:mutating`   | All account-creating tests on Chromium, without retries   |
| `npm run test:ratelimit`  | Manual destructive rate-limit check on Chromium           |
| `npm run report`          | Open the most recent local HTML report                    |

Quality commands:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run format # write formatting changes
```

## CI strategy

Pushes and pull requests run linting, type-checking, formatting checks, and the non-mutating
Playwright suite. This coverage runs across Chromium, Firefox, and WebKit.

The GitHub Actions `workflow_dispatch` trigger additionally runs the `@Mutating` tests on Chromium
with retries disabled. This prevents automatic runs and retries from creating large numbers of
accounts or amplifying QA rate limits. The `@RateLimit` test is never run by CI; it remains an
explicit local diagnostic.

## Coverage

```text
data/
  locales.ts               English/French labels, placeholders, copy, and validation strings
  test-data.factory.ts     Valid and boundary-invalid signup data
lib/
  APIActions.ts            Captures UI-triggered API responses
  BaseTest.ts              Shared Playwright fixtures
  WebActions.ts            Common browser interactions
pageFactory/pageRepository/
  BasePage.ts              Locale-aware navigation
  SignUpPage.ts            Signup locators and form actions
tests/functional/          Happy path, structure/copy, and validation
tests/api/                 Account-creation request/response contract
tests/accessibility/       axe-core, accessible-name, and keyboard checks
tests/responsive/          Layout/overflow checks at mobile, tablet, and desktop viewports
tests/security/            Input handling, response headers, and manual rate limiting
docs/bug-reports/          Reproducible defects found during test development
docs/test-catalog.md       Every automated test, grouped by file, with what each one checks
```

The principal coverage includes:

- English and French signup paths.
- Required fields, email/phone validation, password policy, mismatch, and duplicate email.
- Request and response mapping for `POST /api/accounts`.
- WCAG 2.0/2.1 A/AA automated checks and keyboard access.
- Layout integrity (no horizontal overflow, all fields visible) at mobile, tablet, and desktop widths.
- UI-boundary SQL injection/XSS payload handling and security response headers.
- Localized fields, copy, and province options.

Security coverage here is regression testing at the UI boundary, not a penetration test. It cannot
prove backend query parameterization, authorization correctness, or the absence of stored XSS in
views that are outside this signup flow.

## Known QA limitation

Repeated account creation has produced request timeouts and empty-form validation responses during
development. This is consistent with, but does not conclusively prove, an upstream anti-abuse or
rate-limit control. The symptom is not always a fully blank form: one observed failure had every
field filled correctly except the first one, with the rest of the form intact - so "only part of the
form is empty" is also a sign of this, not just "the whole form is empty." For that reason:

- Default and pull-request tests do not create accounts.
- Mutating tests run only on Chromium and never retry.
- A timeout is treated as a test or environment failure, not as proof that throttling worked.
- The manual rate-limit check passes only when the endpoint returns an explicit HTTP `429`.

Every successful mutating run creates real QA accounts. No supported delete-account endpoint was
identified, so those commands should be used sparingly.

## Known product defects

The detailed reports are in [`docs/bug-reports`](docs/bug-reports). Tests for BUG-003, BUG-005, and
BUG-006 assert the desired behavior and are marked as expected failures with Playwright's
`test.fail()`. They therefore remain visible without treating the current defect as correct behavior.
When a defect is fixed, the unexpected pass prompts removal of the annotation and closure of the
report.

## Design notes

- Language is represented by the `/en/` or `/fr/` URL segment and supplied through a locale fixture.
- Locators favor roles, labels, and exact localized placeholders.
- Assertions live in spec files; page objects and action helpers perform operations and return data.
- Test data uses a unique email for each account-creating submission.
- `POST /api/accounts` request/response assertions were derived from an observed signup submission;
  the contract was not publicly documented.
