import { BrowserContext, Locator, Page } from '@playwright/test';

/**
 * Thin, reusable wrapper around common Playwright interactions.
 * Page Objects drive the UI through this class instead of calling
 * `page`/`locator` methods directly. Assertions are deliberately NOT part
 * of this class - they belong in the test spec, not the action layer.
 */
export class WebActions {
  readonly page: Page;
  readonly context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async check(locator: Locator, checked = true): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    if (checked) {
      await locator.check();
    } else {
      await locator.uncheck();
    }
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }

  async getText(locator: Locator): Promise<string> {
    return (await locator.innerText()).trim();
  }

  async getAttribute(locator: Locator, name: string): Promise<string | null> {
    return locator.getAttribute(name);
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async isChecked(locator: Locator): Promise<boolean> {
    return locator.isChecked();
  }
}
