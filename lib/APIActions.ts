import { Page, Response } from '@playwright/test';

/**
 * Helper for capturing the network call an in-page action triggers.
 * Used to grab the account-creation request/response that fires when the
 * signup form is submitted, without decoupling it from the real
 * user-facing flow. Assertions on the captured response stay in the test
 * spec, not here.
 */
export class APIActions {
  constructor(private readonly page: Page) {}

  /**
   * Waits for a response matching `urlPattern` while `action` runs, and
   * returns it. Default timeout is generous because this QA environment
   * loads several third-party analytics beacons (Datadog RUM, GA, session
   * replay) alongside the real API call, which can push it later in the
   * network queue.
   */
  async captureResponse(
    urlPattern: string | RegExp,
    action: () => Promise<void>,
    options: { method?: string; timeout?: number } = {},
  ): Promise<Response> {
    const { method, timeout = 20_000 } = options;
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (response) => {
          const matchesUrl =
            typeof urlPattern === 'string'
              ? response.url().includes(urlPattern)
              : urlPattern.test(response.url());
          const matchesMethod = method ? response.request().method() === method : true;
          return matchesUrl && matchesMethod;
        },
        { timeout },
      ),
      action(),
    ]);
    return response;
  }

  async json<T = unknown>(response: Response): Promise<T> {
    return response.json() as Promise<T>;
  }
}
