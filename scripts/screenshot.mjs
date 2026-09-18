#!/usr/bin/env node
/**
 * Regenerates the documentation screenshots against a running app.
 *
 * Usage:
 *   npm run build && npm run preview            # terminal 1
 *   node scripts/screenshot.mjs                 # terminal 2  (BASE_URL env to override)
 *
 * Screenshots land in docs/screenshots/. They are documentation artefacts, not
 * test fixtures — the E2E suite is the source of truth for behaviour.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs', 'screenshots');
mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4173/';
const locale = 'bn-BD';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 960, height: 1400 },
  locale,
  permissions: [],
});
const page = await context.newPage();

async function shoot(name, prepare) {
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  if (prepare) await prepare();
  await page.waitForTimeout(250);
  const path = join(outDir, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`wrote ${path}`);
}

await shoot('01-empty');

await shoot('02-result', async () => {
  await page.getByLabel('টাকার পরিমাণ').fill('12450');
  await page.getByLabel('টাকার পরিমাণ').blur();
});

await shoot('03-error', async () => {
  await page.getByLabel('টাকার পরিমাণ').fill('12.005');
  await page.getByLabel('টাকার পরিমাণ').blur();
});

await shoot('04-colloquial-history', async () => {
  const amount = page.getByLabel('টাকার পরিমাণ');
  await page.getByLabel(/সংরক্ষণ করুন/).check();
  await amount.fill('12450');
  await amount.blur();
  await amount.fill('1,23,45,678.50');
  await amount.blur();
  await page.getByLabel(/কথ্য ও সংক্ষিপ্ত/).check();
});

await shoot('05-mobile', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('টাকার পরিমাণ').fill('০.০১');
  await page.getByLabel('টাকার পরিমাণ').blur();
});

await browser.close();
console.log('done');
