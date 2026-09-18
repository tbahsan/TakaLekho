import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Automated accessibility checks. axe-core alone is not enough (the roadmap says
 * so explicitly), so the keyboard walkthrough below covers what axe cannot.
 */

test.describe('accessibility', () => {
  test('no serious or critical axe violations in the default state', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });

  test('no serious or critical axe violations with a result and an error on screen', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill('12450');
    await expect(page.getByTestId('words')).toBeVisible();
    const withResult = await new AxeBuilder({ page }).analyze();
    expect(
      withResult.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => v.id),
    ).toEqual([]);

    await page.getByLabel('টাকার পরিমাণ').fill('12.005');
    const withError = await new AxeBuilder({ page }).analyze();
    expect(
      withError.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => v.id),
    ).toEqual([]);
  });

  test('keyboard only: reach the field, type, switch style, reach copy', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'মূল অংশে যান' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('টাকার পরিমাণ')).toBeFocused();
    await page.keyboard.type('12450');
    await expect(page.getByTestId('words')).toHaveText('বারো হাজার চারশত পঞ্চাশ টাকা মাত্র');

    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/দাপ্তরিক/)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByLabel(/কথ্য ও সংক্ষিপ্ত/)).toBeChecked();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'কপি করুন' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#action-status')).toContainText('কপি হয়েছে');
  });

  test('field is described by its help text and errors are announced', async ({ page }) => {
    await page.goto('/');
    const amount = page.getByLabel('টাকার পরিমাণ');
    await expect(amount).toHaveAttribute('aria-describedby', 'amount-help');
    await amount.fill('007');
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('অতিরিক্ত শূন্য');
  });

  test('results are reachable as text for screen readers and copyable by hand', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('টাকার পরিমাণ').fill('12450');
    const output = page.getByTestId('words');
    await expect(output).toHaveAttribute('for', 'amount');
    const selectable = await output.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return selection?.toString() ?? '';
    });
    expect(selectable).toBe('বারো হাজার চারশত পঞ্চাশ টাকা মাত্র');
  });
});
