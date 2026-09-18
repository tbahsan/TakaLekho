import { expect, test } from '@playwright/test';

/**
 * Offline workflow, on the production preview build.
 *
 * First load needs the network (the service worker has to cache the shell).
 * After that the app must work with the network switched off — the roadmap's
 * release gate for every project in this portfolio.
 */

const SAMPLE_WORDS = 'বারো হাজার চারশত পঞ্চাশ টাকা মাত্র';

test.describe('offline capability', () => {
  test('caches the shell and keeps converting with the network off', async ({ page, context }) => {
    await page.goto('/');

    // The app must say when it is ready; we never claim offline support silently.
    await expect(page.locator('#app-status')).toContainText('অফলাইনের জন্য প্রস্তুত', { timeout: 30_000 });

    // Second load becomes controlled by the service worker.
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByLabel('টাকার পরিমাণ').fill('12450');
    await expect(page.getByTestId('words')).toHaveText(SAMPLE_WORDS);
    await expect(page.locator('#amount-error')).toBeHidden();

    await context.setOffline(false);
  });

  test('serves the cached manifest and icons from the project subpath', async ({ page }) => {
    await page.goto('/');
    const base = new URL(page.url()).pathname;
    const response = await page.request.get(`${base}manifest.webmanifest`);
    expect(response.ok()).toBe(true);
    const manifest = (await response.json()) as { name: string; scope: string; start_url: string };
    expect(manifest.name).toContain('টাকালেখো');
    expect(manifest.scope).toBe(base);
    expect(manifest.start_url).toBe(base);

    const icon = await page.request.get(`${base}icons/icon-192.png`);
    expect(icon.ok()).toBe(true);
    expect(icon.headers()['content-type']).toContain('image/png');
  });

  test('no runtime request leaves the origin', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (!url.hostname.includes('127.0.0.1') && !url.hostname.includes('localhost')) {
        external.push(request.url());
      }
    });

    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill('12450');
    await expect(page.getByTestId('words')).toHaveText(SAMPLE_WORDS);
    await page.waitForTimeout(1000);

    expect(external).toEqual([]);
  });
});
