import { BrowserContext, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { LocaleCopy } from '@data/locales';
import { SignUpData } from '@data/test-data.factory';

/**
 * Page Object for /{locale}/signup.
 *
 * Locators are built from `LocaleCopy` (data/locales.ts) rather than
 * hardcoded strings so the same class drives both the English and French
 * versions of the page - the copy dictionary is the single source of truth
 * for what text should appear in each language.
 */
export class SignUpPage extends BasePage {
  readonly HEADING: Locator;
  readonly FIRST_NAME_INPUT: Locator;
  readonly LAST_NAME_INPUT: Locator;
  readonly PHONE_INPUT: Locator;
  readonly PROVINCE_SELECT: Locator;
  readonly EMAIL_INPUT: Locator;
  readonly PASSWORD_INPUT: Locator;
  readonly CONFIRM_PASSWORD_INPUT: Locator;
  readonly CONSENT_CHECKBOX: Locator;
  readonly SUBMIT_BUTTON: Locator;
  readonly PASSWORD_HINT: Locator;
  readonly CONSENT_LABEL: Locator;
  readonly LOGIN_LINK: Locator;
  readonly TERMS_LINK: Locator;
  readonly PRIVACY_LINK: Locator;
  readonly LOGO: Locator;
  readonly LOGO_LINK: Locator;

  constructor(
    page: Page,
    context: BrowserContext,
    private readonly copy: LocaleCopy,
  ) {
    super(page, context);
    this.HEADING = page.getByRole('heading', { name: copy.heading, exact: true });
    this.FIRST_NAME_INPUT = page.getByPlaceholder(copy.placeholders.firstName, { exact: true });
    this.LAST_NAME_INPUT = page.getByPlaceholder(copy.placeholders.lastName, { exact: true });
    this.PHONE_INPUT = page.getByPlaceholder(copy.placeholders.phone, { exact: true });
    this.PROVINCE_SELECT = page.getByLabel(copy.labels.province, { exact: true });
    this.EMAIL_INPUT = page.getByPlaceholder(copy.placeholders.email, { exact: true });
    // Both password fields' placeholders end in "password"/"passe" - exact:true is required
    // or getByPlaceholder("Password") would ambiguously match "Confirm password" too.
    this.PASSWORD_INPUT = page.getByPlaceholder(copy.placeholders.password, { exact: true });
    this.CONFIRM_PASSWORD_INPUT = page.getByPlaceholder(copy.placeholders.confirmPassword, {
      exact: true,
    });
    this.CONSENT_CHECKBOX = page.getByRole('checkbox');
    this.SUBMIT_BUTTON = page.getByRole('button', { name: copy.submitButton, exact: true });
    this.PASSWORD_HINT = page.getByText(copy.passwordHint, { exact: true });
    this.CONSENT_LABEL = page.getByText(copy.consentText, { exact: true });
    this.LOGIN_LINK = page.getByRole('link', { name: copy.loginLinkText, exact: true });
    // Not exact: true - the live app's accessible name appends "(opens in a
    // new window)" via aria-label, on top of the visible text stored here.
    this.TERMS_LINK = page.getByRole('link', { name: copy.termsLink.text });
    this.PRIVACY_LINK = page.getByRole('link', { name: copy.privacyLink.text });
    // alt="nesto" is identical in both locales - exact:true avoids matching
    // the separate "nesto secure" trust-badge image elsewhere on the page.
    this.LOGO = page.getByAltText('nesto', { exact: true });
    this.LOGO_LINK = page.locator('a[href="/"]').filter({ has: this.LOGO });
  }

  get locale() {
    return this.copy.locale;
  }

  async navigateToSignUp(): Promise<void> {
    await this.goto('/signup', this.copy.locale);
  }

  async fillSignUpForm(data: SignUpData): Promise<void> {
    await this.actions.fill(this.FIRST_NAME_INPUT, data.firstName);
    await this.actions.fill(this.LAST_NAME_INPUT, data.lastName);
    await this.actions.fill(this.PHONE_INPUT, data.phone);
    await this.actions.selectOption(this.PROVINCE_SELECT, data.province);
    await this.actions.fill(this.EMAIL_INPUT, data.email);
    await this.actions.fill(this.PASSWORD_INPUT, data.password);
    await this.actions.fill(this.CONFIRM_PASSWORD_INPUT, data.confirmPassword);
    if (data.consent) {
      await this.actions.check(this.CONSENT_CHECKBOX, true);
    }
  }

  async submit(): Promise<void> {
    await this.actions.click(this.SUBMIT_BUTTON);
  }

  /**
   * Reads the inline validation error text wired to a field via
   * `aria-describedby` (the app's pattern: `aria-invalid="true"` +
   * `aria-describedby="form-error-message-field-N"`).
   */
  async errorFor(field: Locator): Promise<string | null> {
    const describedBy = await field.getAttribute('aria-describedby');
    if (!describedBy) return null;
    const texts = await Promise.all(
      describedBy.split(' ').map((id) =>
        this.page
          .locator(`#${id}`)
          .innerText()
          .catch(() => ''),
      ),
    );
    const joined = texts
      .map((t) => t.trim())
      .filter(Boolean)
      .join(' ');
    return joined || null;
  }

  provinceOptionLabel(code: string): string {
    return this.copy.provinceOptions[code];
  }
}
