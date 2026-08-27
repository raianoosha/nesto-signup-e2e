# BUG-003: Email field uses `type="text"` instead of `type="email"`

- **Severity**: Low (UX/accessibility, no functional blocker)
- **Environment**: QA — `https://app.qa.nesto.ca/en/signup` (and `/fr/signup`)

## Steps to reproduce

1. Navigate to the signup page.
2. Inspect the Email input's `type` attribute (e.g. via devtools, or `document.querySelector('input[placeholder="Email"]').type`).

## Expected

`type="email"`, so that:

- Mobile browsers show an email-optimized keyboard (`@`, no auto-capitalization).
- Browsers can offer native autofill/validation affordances for email fields.

## Actual

The input renders as `type="text"`. Client-side email-format validation still works (there is a custom "Invalid email" check), but the input loses the native browser/mobile-keyboard benefits of a proper email input.

## Notes

Low priority; flagging since it's an easy, low-risk fix and was directly observed while asserting on
field attributes for coverage. The automated check asserts the desired `type="email"` behavior and is
marked as an expected failure until this defect is fixed.
