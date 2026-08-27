# BUG-004: `flowLanguage` cookie is set to the literal string `"undefined"`

- **Severity**: Low (no observed functional impact during recon, but suggests a serialization bug on the app side)
- **Environment**: QA — `https://app.qa.nesto.ca/en/signup`

## Steps to reproduce

1. Navigate to `https://app.qa.nesto.ca/en/signup` in a fresh context.
2. Run `document.cookie` in devtools and locate the `flowLanguage` entry.

## Expected

Either the cookie is absent until a real language value exists, or it holds an actual locale code (e.g. `en`/`fr`).

## Actual

The cookie is present with the literal value `undefined` (the string, not an absent value) — i.e. `flowLanguage=undefined`. This is the classic symptom of code doing something like `` `flowLanguage=${maybeUndefinedVar}` `` without checking that the variable is set first.

## Notes

Did not find a UI-visible consequence of this during recon — language switching itself is handled via the `/en/...` vs `/fr/...` URL path, not this cookie. Flagging because a stray literal-`"undefined"` cookie value is a reliable signal of a real code path not handling the unset case, and whatever server/analytics code reads this cookie downstream may be getting the string `"undefined"` instead of the absence of a value it might be checking for.
