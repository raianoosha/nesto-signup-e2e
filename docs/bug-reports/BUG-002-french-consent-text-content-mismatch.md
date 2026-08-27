# BUG-002: French marketing-consent checkbox text contains a clause the English version doesn't

- **Severity**: Medium (this is consent/legal copy — a substantive difference in meaning between locales, not just wording, is a compliance concern rather than a pure translation nit)
- **Environment**: QA — `https://app.qa.nesto.ca/en/signup` vs `https://app.qa.nesto.ca/fr/signup`

## Steps to reproduce

1. Navigate to `https://app.qa.nesto.ca/en/signup` and read the text next to the marketing-consent checkbox.
2. Navigate to `https://app.qa.nesto.ca/fr/signup` and read the equivalent text.
3. Compare.

## English (as rendered)

> By checking this box, you agree to be contacted by nesto's partners for the purposes of offering you financial products. You agree to nesto sharing your mortgage information with its partners. You can opt-out at any time.

## French (as rendered)

> En cochant cette case, vous acceptez d'être contacté par les partenaires de nesto dans le but de vous proposer des produits financiers. Vous acceptez que nesto partage vos informations de demande hypothécaire avec ses partenaires, **si nous ne sommes pas en mesure de vous fournir nos services**. Vous pouvez vous désinscrire à tout moment.

## Expected

Both locales should convey the same consent scope, since this checkbox drives a real data-sharing agreement (`leadDistributeConsentAgreement` in the account-creation payload).

## Actual

The French version adds a conditional clause — roughly "if we are unable to provide you our services" — that is absent from the English text. As written, French users are told their mortgage information is only shared with partners in a specific circumstance (nesto being unable to serve them), while English users are told it may be shared with partners without that qualifier. That's a meaningful difference in what each locale's users are consenting to, not just phrasing.

## Notes

Recommend legal/content review to confirm which version reflects the intended consent scope, then
align the other locale to match. Both exact strings are recorded in `data/locales.ts`
(`locales.en.consentText` / `locales.fr.consentText`) for the localized-copy coverage in
`tests/functional/SignUpFieldsAndLabels.test.ts`.
