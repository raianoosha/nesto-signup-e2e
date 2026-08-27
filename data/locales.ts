import { Locale } from '../testConfig';

export interface LocaleCopy {
  locale: Locale;
  path: string;
  heading: string;
  placeholders: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  labels: {
    province: string;
  };
  /** Province code -> localized option label, as rendered in the select. */
  provinceOptions: Record<string, string>;
  passwordHint: string;
  consentText: string;
  submitButton: string;
  loginLinkText: string;
  termsConsentText: string;
  /** The standalone "Terms of Service" / "Privacy Policy" footer links (open in a new tab). */
  termsLink: { text: string; href: string };
  privacyLink: { text: string; href: string };
  errors: {
    required: string;
    invalidEmail: string;
    invalidValue: string;
    passwordTooShort: string;
    /**
     * Only confirmed in English ("Passwords do not match"). The French
     * equivalent could not be reliably captured (the app's validation for
     * this field was intermittent during recon), so it's left undefined -
     * tests should fall back to a generic aria-invalid + non-empty-message
     * check for locales where this isn't set.
     */
    passwordMismatch?: string;
  };
}

const provinceOptionsEn: Record<string, string> = {
  ON: 'Ontario',
  QC: 'Quebec',
  AB: 'Alberta',
  BC: 'British-Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NS: 'Nova Scotia',
  NL: 'Newfoundland and Labrador',
  PE: 'Prince Edward Island',
  SK: 'Saskatchewan',
  NT: 'Northwest Territories',
  YT: 'Yukon',
  NU: 'Nunavut',
};

const provinceOptionsFr: Record<string, string> = {
  ON: 'Ontario',
  QC: 'Québec',
  AB: 'Alberta',
  BC: 'Colombie-Britannique',
  MB: 'Manitoba',
  NB: 'Nouveau-Brunswick',
  NS: 'Nouvelle-Écosse',
  NL: 'Terre-Neuve-et-Labrador',
  PE: 'Île-du-Prince-Édouard',
  SK: 'Saskatchewan',
  NT: 'Territoires du Nord-Ouest',
  YT: 'Yukon',
  NU: 'Nunavut',
};

export const locales: Record<Locale, LocaleCopy> = {
  en: {
    locale: 'en',
    path: '/en/signup',
    heading: 'Create a nesto account',
    placeholders: {
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone number',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
    },
    labels: {
      province: 'Province of purchase',
    },
    provinceOptions: provinceOptionsEn,
    passwordHint:
      'Password must be between 12 and 32 characters and contain one uppercase letter, one lowercase letter and one number.',
    consentText:
      'By checking this box, you agree to be contacted by nesto’s partners for the purposes of offering you financial products. You agree to nesto sharing your mortgage information with its partners. You can opt-out at any time.',
    submitButton: 'Create your account',
    loginLinkText: 'Log in',
    termsConsentText:
      'By clicking on "Create your account", I agree and consent to the Terms of Service.',
    termsLink: { text: 'Terms of Service', href: 'https://www.nesto.ca/terms-of-services/' },
    privacyLink: { text: 'Privacy Policy', href: 'https://www.nesto.ca/privacy-policy/' },
    errors: {
      required: 'The field is required',
      invalidEmail: 'Invalid email',
      invalidValue: 'Invalid value',
      passwordTooShort: 'Minimum of 12 letters required',
      passwordMismatch: 'Passwords do not match',
    },
  },
  fr: {
    locale: 'fr',
    path: '/fr/signup',
    heading: 'Créez un compte nesto',
    placeholders: {
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      email: 'Courriel',
      password: 'Mot de passe',
      confirmPassword: 'Confirmation du mot de passe',
    },
    labels: {
      province: "Province de l'achat",
    },
    provinceOptions: provinceOptionsFr,
    // NOTE: transcribed verbatim from the live app, including the "au entre" grammar
    // defect - see docs/bug-reports. Do not "fix" this string without updating the
    // bug report / re-checking the app.
    passwordHint:
      'Le mot de passe doit contenir au entre 12 et 32 caractères et contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.',
    consentText:
      'En cochant cette case, vous acceptez d’être contacté par les partenaires de nesto dans le but de vous proposer des produits financiers. Vous acceptez que nesto partage vos informations de demande hypothécaire avec ses partenaires, si nous ne sommes pas en mesure de vous fournir nos services. Vous pouvez vous désinscrire à tout moment.',
    submitButton: 'Créez votre compte',
    loginLinkText: 'Connectez-vous',
    termsConsentText:
      'En cliquant sur "Créez votre compte", j\'accepte et consens aux Conditions d\'utilisation.',
    termsLink: {
      text: "Conditions d'utilisation",
      href: 'https://www.nesto.ca/fr/conditions-d-utilisation/',
    },
    privacyLink: {
      text: 'politique de confidentialité',
      href: 'https://www.nesto.ca/fr/politique-de-confidentialite/',
    },
    errors: {
      required: 'Ce champ est obligatoire.',
      invalidEmail: 'Courriel invalide',
      invalidValue: 'Valeur invalide.',
      passwordTooShort: 'Minimum de 12 lettres requises',
    },
  },
};
