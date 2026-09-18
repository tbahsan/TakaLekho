import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * Playwright loads specs through Node's ESM loader, which needs an explicit
 * import attribute for JSON — so the golden fixture is read from disk here.
 * It is the same single source of truth the unit tests use.
 */
type GoldenCase = { input: string; official: string; colloquial: string };
type GoldenFixture = { accepted: GoldenCase[]; rejected: Array<{ input: string; code: string }> };

const here = dirname(fileURLToPath(import.meta.url));
const golden: GoldenFixture = JSON.parse(
  readFileSync(join(here, '..', 'fixtures', 'golden.json'), 'utf8'),
) as GoldenFixture;

const sample = golden.accepted.find((item) => item.input === '12450') as GoldenCase;

test.describe('core conversion', () => {
  test('loads in Bengali and explains what it does', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('বাংলা কথায়');
    await expect(page.getByLabel('টাকার পরিমাণ')).toBeVisible();
  });

  test('converts an amount exactly as the golden fixture says', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill(sample.input);
    await expect(page.getByTestId('words')).toHaveText(sample.official);
    await expect(page.locator('#normalized-latin')).toHaveText('12,450');
  });

  test('shows the domestic grouping hint only when the two conventions differ', async ({ page }) => {
    await page.goto('/');
    const amount = page.getByLabel('টাকার পরিমাণ');

    await amount.fill('12450');
    await expect(page.locator('#grouping-hint')).toBeHidden();

    await amount.fill('100000');
    await expect(page.locator('#grouping-hint')).toBeVisible();
    await expect(page.locator('#grouping-hint')).toContainText('১,০০,০০০');

    await amount.fill('1,00,000');
    await expect(page.locator('#grouping-hint')).toBeHidden();
  });

  test('accepts Bengali digits and gives the same words', async ({ page }) => {
    await page.goto('/');
    const amount = page.getByLabel('টাকার পরিমাণ');
    await amount.fill('12450');
    const latin = await page.getByTestId('words').textContent();
    await amount.fill('১২৪৫০');
    await expect(page.getByTestId('words')).toHaveText(latin ?? '');
    await expect(page.getByTestId('words')).toHaveText(sample.official);
  });

  test('handles poisha without rounding', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill('12.05');
    await expect(page.getByTestId('words')).toHaveText('বারো টাকা পাঁচ পয়সা মাত্র');
    await page.getByLabel('টাকার পরিমাণ').fill('12.00');
    await expect(page.getByTestId('words')).toHaveText('বারো টাকা মাত্র');
  });

  test('switching to the experimental style updates the sentence', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill(sample.input);
    await page.getByLabel(/কথ্য ও সংক্ষিপ্ত/).check();
    await expect(page.getByTestId('words')).toHaveText(sample.colloquial);
    await expect(page.locator('#result-body')).toContainText('পরীক্ষামূলক');
  });

  test('shows a specific error and never leaves a stale result behind', async ({ page }) => {
    await page.goto('/');
    const amount = page.getByLabel('টাকার পরিমাণ');

    await amount.fill('12450');
    await expect(page.getByTestId('words')).toHaveText(sample.official);

    await amount.fill('12.005');
    await expect(page.getByRole('alert')).toContainText('দশমিকের পরে সর্বোচ্চ দুই ঘর');
    await expect(page.locator('#result-body')).toBeHidden();
    await expect(page.getByTestId('words')).toBeHidden();
    await expect(page.locator('#result-invalid')).toBeVisible();
    await expect(amount).toHaveAttribute('aria-invalid', 'true');

    // Emptying the field returns to the neutral empty state, not to the old answer.
    await amount.fill('');
    await expect(page.locator('#result-empty')).toBeVisible();
    await expect(page.getByRole('alert')).toBeHidden();
  });

  test('every rejected fixture produces a readable error', async ({ page }) => {
    await page.goto('/');
    const amount = page.getByLabel('টাকার পরিমাণ');

    // An empty field is the neutral “nothing typed yet” state, not an error.
    for (const item of golden.rejected.filter((entry) => entry.input.trim().length === 0)) {
      await amount.fill(item.input);
      await expect(page.getByTestId('result-empty')).toBeVisible();
      await expect(page.getByRole('alert')).toBeHidden();
      await expect(page.locator('#result-body')).toBeHidden();
    }

    for (const item of golden.rejected.filter((entry) => entry.input.trim().length > 0)) {
      await amount.fill(item.input);
      await expect(page.getByRole('alert'), `${item.input} should show ${item.code}`).toBeVisible();
      await expect(page.locator('#result-body')).toBeHidden();
    }
  });

  test('Escape clears the field without touching anything else', async ({ page }) => {
    await page.goto('/');
    const amount = page.getByLabel('টাকার পরিমাণ');
    await amount.fill('1234');
    await amount.press('Escape');
    await expect(amount).toHaveValue('');
    await expect(page.locator('#result-empty')).toBeVisible();
  });
});

test.describe('output, tables and export', () => {
  test('the example table is generated from the live engine', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('#examples-body tr');
    expect(await rows.count()).toBeGreaterThan(5);
    await expect(rows.first()).toContainText('শূন্য টাকা মাত্র');
  });

  test('copy puts the sentence on the clipboard', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill(sample.input);
    await page.getByRole('button', { name: 'কপি করুন' }).click();
    await expect(page.locator('#action-status')).toContainText('কপি হয়েছে');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(sample.official);
  });

  test('download produces a plain-text file with the sentence inside', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill(sample.input);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'TXT ডাউনলোড' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('takalekho-12450.txt');
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const content = Buffer.concat(chunks).toString('utf8');
    expect(content).toContain(sample.official);
    expect(content).toContain('ইনপুট: 12450');
  });

  test('export buttons are unavailable while the input is invalid', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill('abc');
    await expect(page.getByRole('button', { name: 'কপি করুন' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'TXT ডাউনলোড' })).toBeHidden();
  });
});

test.describe('optional local history', () => {
  test('stores nothing until the user opts in, then clears on request', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('টাকার পরিমাণ').fill(sample.input);
    await page.getByLabel('টাকার পরিমাণ').blur();
    let keys = await page.evaluate(() => Object.keys(window.localStorage));
    expect(keys).toEqual([]);

    await page.getByLabel(/সংরক্ষণ করুন/).check();
    await page.getByLabel('টাকার পরিমাণ').blur();
    await expect(page.locator('#history-list li')).toHaveCount(1);
    await expect(page.locator('#history-list')).toContainText(sample.official);
    keys = await page.evaluate(() => Object.keys(window.localStorage));
    expect(keys.sort()).toEqual(['takalekho.history.v1', 'takalekho.settings.v1']);

    // Reload keeps the setting and the entry.
    await page.reload();
    await expect(page.getByLabel(/সংরক্ষণ করুন/)).toBeChecked();

    await page.getByRole('button', { name: 'সংরক্ষিত সব মুছুন' }).click();
    keys = await page.evaluate(() => Object.keys(window.localStorage));
    expect(keys).toEqual([]);
    await expect(page.locator('#history-empty')).toBeVisible();
  });

  test('a stored entry can be restored into the field', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/সংরক্ষণ করুন/).check();
    await page.getByLabel('টাকার পরিমাণ').fill('99');
    await page.getByLabel('টাকার পরিমাণ').blur();
    await expect(page.locator('#history-list li')).toHaveCount(1);

    await page.getByLabel('টাকার পরিমাণ').fill('');
    await page.locator('#history-list button').first().click();
    await expect(page.getByLabel('টাকার পরিমাণ')).toHaveValue('99');
    await expect(page.getByTestId('words')).toHaveText('নিরানব্বই টাকা মাত্র');
  });
});
