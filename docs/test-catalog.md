# Test Catalog

Every automated test in this suite, grouped by file. "Instances" accounts for tests generated in a
loop over both locales (`en`/`fr`) — the test body is written once but runs twice, as two separate,
independently-reportable results.

**Mutating** = creates a real account on the shared QA environment. See the README's "Known QA
limitation" before running these more than necessary.

---

## tests/functional/SignUp.test.ts — 2 tests, both Mutating

The happy path: one full, valid signup per locale, proving the form works end-to-end.

| Test                                 | Tags                       | Mutating |
| ------------------------------------ | -------------------------- | -------- |
| Verify Signup - happy path (English) | `@Smoke` `@en` `@Mutating` | Yes      |
| Verify Signup - happy path (French)  | `@Smoke` `@fr` `@Mutating` | Yes      |

Each: fills the form with valid, freshly-generated data (province QC, consent checked), submits, and
confirms the browser navigates away from `/signup`.

---

## tests/functional/SignUpFieldsAndLabels.test.ts — 9 tests × 2 locales = 18 instances

Structural and copy coverage. Never submits the form, so it never creates an account.

| Test                                                                               | Notes                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Verify the heading and every expected field render                                 | Every field/button/link is visible                                                                                                                                                                                 |
| Verify field input types are correct                                               | `type="text"/"tel"/"password"/"checkbox"` on the relevant fields                                                                                                                                                   |
| Verify the email field uses native email semantics                                 | **Expected to fail** ([BUG-003](bug-reports/BUG-003-email-input-type-not-email.md)): asserts `type="email"`, which the live app doesn't have yet                                                                   |
| Verify the marketing-consent checkbox is optional and unchecked by default         | Not checked, not `required`                                                                                                                                                                                        |
| Verify static copy (password hint, consent text) matches the expected locale text  | Pulled from `data/locales.ts`                                                                                                                                                                                      |
| Verify submit button and login link show the expected localized text               |                                                                                                                                                                                                                    |
| Verify the province dropdown lists every expected option with the localized label  | All 13 provinces, both locales' labels                                                                                                                                                                             |
| Verify the Terms of Service and Privacy Policy links point to a real, working page | Checks `href`/`target="_blank"` against the localized URL, then makes a real HTTP request to each URL and confirms it doesn't 404                                                                                  |
| Verify the company logo is visible, links to home, and loads successfully          | Confirms the header logo image (`alt="nesto"`, distinct from the separate "nesto secure" trust badge) is visible, wrapped in a link to `/`, has a real `src`, and actually decoded pixel data (not a broken image) |

---

## tests/functional/SignUpValidation.test.ts — 10 tests × 2 locales = 20 instances (1 test × 2 locales is Mutating)

Negative-path coverage: confirms bad input is rejected with the right message, and that nothing gets
created when it should be rejected.

| Test                                                                                | Notes                                                                                                                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Verify submitting a completely empty form surfaces per-field errors                 | Checks all 5 required fields, exact error text per locale, and that the URL is still `/signup`                                        |
| Verify invalid email formats are rejected client-side                               | Loops over 4 malformed emails (`not-an-email`, `missing-domain@`, `@missing-local.com`, `spaces in@email.com`)                        |
| Verify a password shorter than 12 characters is rejected                            | Exact "too short" message confirmed against the live app                                                                              |
| Verify a password violating "tooLong" is rejected                                   | Generated test; checks _some_ error shows (exact wording unconfirmed)                                                                 |
| Verify a password violating "noUppercase" is rejected                               | Generated test; same caveat                                                                                                           |
| Verify a password violating "noLowercase" is rejected                               | Generated test; same caveat                                                                                                           |
| Verify a password violating "noDigit" is rejected                                   | Generated test; same caveat                                                                                                           |
| Verify mismatched password/confirm-password is rejected                             | Exact text checked for English; French falls back to "some message" since the exact wording wasn't confirmed                          |
| Verify invalid phone numbers are rejected                                           | Loops over 3 malformed phone numbers (`123`, `abcdefghij`, `555`)                                                                     |
| Verify signing up twice with the same email does not silently succeed a second time | **Mutating**, `test.slow()` (30s timeouts) — signs up once (expects 201), then again with the same email (expects anything _but_ 201) |

---

## tests/api/SignUpAccounts.test.ts — 2 tests, both Mutating

Validates the actual network contract behind the "Create your account" button, not just what's shown
on screen.

| Test                                                                                             | Tags                                    | Notes                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Verify POST /api/accounts returns 201 with a request/response that match the submitted form data | `@API` `@Mutating` (×2, one per locale) | Confirms: status is 201; the outgoing request body matches what was typed (including the `+1` phone prefix and the correct `language`); the response body echoes the same account data; the password is never present in the response; a valid Bearer access token is returned |

---

## tests/accessibility/SignUpAccessibility.test.ts — 3 tests × 2 locales = 6 instances

None of these submit the form - safe to run anytime, any frequency.

| Test                                                                         | Notes                                                                         |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Verify the page has no automatically detectable WCAG 2.0/2.1 A/AA violations | Full axe-core scan; violations attached to the report even on pass            |
| Verify every form field has an accessible name                               | All 8 interactive fields (name, phone, province, email, password ×2, consent) |
| Verify the whole form is reachable and operable by keyboard alone            | Tab-only navigation reaches every field and the submit button, in order       |

---

## tests/responsive/SignUpResponsive.test.ts — 3 tests × 2 locales = 6 instances

Lightweight layout smoke checks, not full visual regression testing (no screenshot/pixel diffing,
no baseline images to maintain). Never submits the form - safe to run anytime, any frequency.

| Test                                                  | Notes                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Verify the signup form holds up at mobile (375x812)   | No horizontal overflow; every field and the submit button stay visible |
| Verify the signup form holds up at tablet (768x1024)  | Same checks                                                            |
| Verify the signup form holds up at desktop (1440x900) | Same checks                                                            |

---

## tests/security/SignUpSecurity.test.ts — 6 tests, English only

Explicitly scoped as UI-boundary regression testing, not a penetration test (see the file's header
comment for what it can't prove: no backend/DB verification, no CSRF/session/IDOR testing).

| Test                                                                                                      | Tags        | Mutating | Notes                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verify SQL injection / XSS payloads in strictly-validated fields are rejected without creating an account | `@Security` | No       | Puts every SQLi/XSS payload into the Email field; confirms client-side format validation rejects all of them                                                                                                   |
| Verify SQL injection and XSS payloads in free-text name fields are handled safely end-to-end              | `@Mutating` | Yes      | One signup with a SQLi string as First name and an XSS string as Last name; checks no server error, no leaked DB error text, values stored literally, and no live `<script>` tag ends up on the resulting page |
| Verify the account-creation response never exposes the submitted password                                 | `@Mutating` | Yes      | Confirms the raw password never appears in the response body, headers, or URL                                                                                                                                  |
| Verify standard security response headers are present on the signup page                                  |             | No       | Hard-asserts `X-Content-Type-Options: nosniff`, HSTS, and that `X-Frame-Options` contains `DENY`                                                                                                               |
| Verify X-Frame-Options has one valid DENY value                                                           |             | No       | **Expected to fail** ([BUG-005](bug-reports/BUG-005-duplicate-x-frame-options-header.md)): the live header is duplicated (`DENY,DENY`)                                                                         |
| Verify the signup page provides a Content-Security-Policy                                                 |             | No       | **Expected to fail** ([BUG-006](bug-reports/BUG-006-missing-content-security-policy.md)): no CSP header exists yet                                                                                             |

---

## tests/security/SignUpRateLimit.test.ts — 1 test, English only, excluded from all normal runs

The closest meaningful equivalent to "brute force" for a page with no password to guess: proves the
account-creation endpoint actually throttles a burst of rapid signups.

| Test                                                                    | Tags                           | Notes                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verify a configured signup burst receives an explicit HTTP 429 response | `@RateLimit` `@Mutating` `@en` | Fires up to 3 rapid signups (configurable via `RATE_LIMIT_ATTEMPTS`), stopping early on the first `429`. **Fails** if none of the attempts return an explicit 429 - a plain timeout is treated as a test/environment failure, not proof of throttling. Excluded from every other script via `--grep-invert "@Mutating | @RateLimit"`; run deliberately with `npm run test:ratelimit` |

---

## Totals

| Category                                           | Test instances | Of which Mutating |
| -------------------------------------------------- | -------------- | ----------------- |
| Functional (happy path, fields/labels, validation) | 40             | 4                 |
| API contract                                       | 2              | 2                 |
| Accessibility                                      | 6              | 0                 |
| Responsive                                         | 6              | 0                 |
| Security                                           | 6              | 2                 |
| Rate limit (opt-in only)                           | 1              | 1                 |
| **Total**                                          | **61**         | **9**             |

Of the 9 mutating instances, only the last one (`SignUpRateLimit.test.ts`) is excluded from every
`npm run test*` command by default - the other 8 run as part of `npm run test:mutating` and the
individual `test:positive` / `test:negative` / `test:api` / `test:security` scripts, but are excluded
from the plain `npm test` / `test:en` / `test:fr` / CI's default job via the `@Mutating` tag.
