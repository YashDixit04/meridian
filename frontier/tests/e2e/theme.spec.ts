import { expect, test } from '@playwright/test';
import { seedAuthenticatedSession } from './auth';

test.describe('Navbar theme color picker', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('theme-toggler-trigger')).toBeVisible();
  });

  test('selects one mode or preset, and only one primary swatch', async ({ page }) => {
    await page.getByTestId('theme-toggler-trigger').click();
    await expect(page.getByTestId('theme-toggler-panel')).toBeVisible();

    await page.getByTestId('theme-scheme-darkest').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('data-aurora-color-scheme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme-preset', 'default');

    await page.getByTestId('theme-preset-nature').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme-preset', 'nature');
    await expect(page.getByTestId('theme-preset-nature')).toHaveAttribute('data-checked', 'true');
    await expect(page.getByTestId('theme-scheme-darkest')).toHaveAttribute('data-checked', 'false');

    await page.getByTestId('theme-scheme-lightest').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme-preset', 'default');
    await expect(page.locator('html')).toHaveAttribute('data-aurora-color-scheme', 'light');
    await expect(page.getByTestId('theme-scheme-lightest')).toHaveAttribute('data-checked', 'true');
    await expect(page.getByTestId('theme-preset-nature')).toHaveAttribute('data-checked', 'false');

    await page.getByTestId('theme-preset-luxury').click();
    const luxuryPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
    );
    expect(luxuryPrimary.toUpperCase()).toBe('#9E3B3B');
    await expect(page.locator('[data-testid^="theme-swatch-"][data-selected="true"]')).toHaveCount(0);

    await page.getByTestId('theme-swatch-0D9488').click();
    await page.getByTestId('theme-swatch-9E3B3B').click();

    await expect(page.locator('[data-testid^="theme-swatch-"][data-selected="true"]')).toHaveCount(1);
    await expect(page.getByTestId('theme-swatch-9E3B3B')).toHaveAttribute('data-selected', 'true');
    await expect(page.getByTestId('theme-swatch-0D9488')).toHaveAttribute('data-selected', 'false');

    const swatchPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
    );
    expect(swatchPrimary.toUpperCase()).toBe('#9E3B3B');
    await expect(page.locator('html')).toHaveAttribute('data-theme-primary', '#9E3B3B');
  });
});
