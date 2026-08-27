import { BrowserContext, Page } from '@playwright/test';
import { WebActions } from '@lib/WebActions';
import { Locale } from '../../testConfig';

/**
 * Shared base for all Page Objects.
 */
export class BasePage {
  readonly page: Page;
  readonly context: BrowserContext;
  protected readonly actions: WebActions;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    this.actions = new WebActions(page, context);
  }

  /**
   * Language is a real URL segment on this app (`/en/...` vs `/fr/...`),
   * not a persisted client-side preference - confirmed by inspecting the
   * live app: the in-page "FR"/"Menu" language toggles just navigate to
   * the `/fr/...` route, and reloading `/en/...` always renders English.
   * So switching locale for a test is just navigating to the right path.
   */
  async goto(path: string, locale: Locale): Promise<void> {
    const localizedPath = path.startsWith(`/${locale}/`) ? path : `/${locale}${path}`;
    await this.actions.goto(localizedPath);
  }
}
