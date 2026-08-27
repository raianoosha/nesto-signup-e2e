# BUG-001: French password-hint text has a grammar defect ("au entre")

- **Severity**: Low (cosmetic/content quality, no functional impact)
- **Environment**: QA — `https://app.qa.nesto.ca/fr/signup`

## Steps to reproduce

1. Navigate to `https://app.qa.nesto.ca/fr/signup`.
2. Read the helper text under the "Mot de passe" field.

## Expected

Grammatically correct French, e.g. either:

- "Le mot de passe doit contenir entre 12 et 32 caractères..." (drop "au"), or
- "Le mot de passe doit contenir au moins 12 caractères..." (drop "entre ... 32").

## Actual

The rendered text is:

> Le mot de passe doit contenir au entre 12 et 32 caractères et contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.

"au entre" is not valid French — it reads as two competing phrasings ("au moins" / "entre X et Y") merged together. The English version does not have this problem:

> Password must be between 12 and 32 characters and contain one uppercase letter, one lowercase letter and one number.

## Notes

Captured verbatim via `document.querySelector('form').textContent` on the live page to rule out a transcription error on our end. The exact string is pinned in `data/locales.ts` (`locales.fr.passwordHint`) so this test will start failing the moment the copy is fixed — that's expected and is the signal to update the fixture string.
