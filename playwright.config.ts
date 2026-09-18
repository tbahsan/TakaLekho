import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the **production preview** build, not the dev server, because
 * the service worker, cache scoping and the project subpath only exist there.
 *
 * PAGES_BASE_PATH is forwarded from the environment so the same suite can verify
 * `https://<owner>.github.io/<repo>/` style deployments, where root-only tests
 * would miss subpath bugs.
 */
const basePath = process.env.PAGES_BASE_PATH ?? '/';
const port = Number(process.env.PREVIEW_PORT ?? 4173);
const host = '127.0.0.1';
const origin = `http://${host}:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `${origin}${basePath}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${port} --strictPort`,
    url: `${origin}${basePath}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
