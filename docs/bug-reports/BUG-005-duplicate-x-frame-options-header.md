# BUG-005: `X-Frame-Options` response header has a duplicated value

- **Severity**: Low (browsers appear to still enforce deny; this is a signal of a config/proxy issue, not a live clickjacking hole)
- **Environment**: QA — `GET https://app.qa.nesto.ca/en/signup`

## Steps to reproduce

1. `curl -sI https://app.qa.nesto.ca/en/signup` (or inspect the response headers in devtools/Playwright).
2. Look at the `X-Frame-Options` header.

## Expected

`X-Frame-Options: DENY`

## Actual

`X-Frame-Options: DENY,DENY` - the value is duplicated. This is the classic symptom of two layers both
setting the same security header (e.g. a CDN/edge proxy and the origin app both adding it) without
either checking whether it's already present.

## Notes

Found while adding `tests/security/SignUpSecurity.test.ts`'s security-headers check. Functionally
this still communicates "deny framing" to browsers, so it's not an active vulnerability, but it's
worth fixing at the source (dedupe at whichever layer is adding it twice) since a malformed/duplicated
security header is a red flag that the same misconfiguration could affect other headers less
gracefully. The automated check asserts a single `DENY` value and is marked as an expected failure
until this defect is fixed.
