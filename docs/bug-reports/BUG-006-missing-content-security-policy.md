# BUG-006: No `Content-Security-Policy` header on the signup page

- **Severity**: Medium (hardening gap, not a demonstrated live exploit) - this page collects PII and
  credentials for a financial services product, which raises the bar for defense-in-depth against XSS
- **Environment**: QA — `GET https://app.qa.nesto.ca/en/signup`

## Steps to reproduce

1. `curl -sI https://app.qa.nesto.ca/en/signup` (or inspect response headers in devtools/Playwright).
2. Look for a `Content-Security-Policy` (or `Content-Security-Policy-Report-Only`) header.

## Expected

Some `Content-Security-Policy` present, even a starter/report-only policy, given the page handles
name/email/phone/password submission.

## Actual

No CSP header is sent at all. `Referrer-Policy` is also absent. The page does correctly send
`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options` (see BUG-005
for a defect in that one), so this isn't a from-scratch security posture - CSP/Referrer-Policy just
weren't included.

## Notes

Recommend starting with a `Content-Security-Policy-Report-Only` policy to establish a baseline
without risking breakage, then tightening to enforced `Content-Security-Policy` once report data
confirms it's safe. This is a defense-in-depth recommendation, not evidence of an active
vulnerability. `tests/security/SignUpSecurity.test.ts` asserts that CSP should be present and marks
the check as an expected failure until this defect is fixed.
