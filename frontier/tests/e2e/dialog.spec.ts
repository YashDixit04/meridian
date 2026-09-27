import { expect, test } from '@playwright/test';
import { seedAuthenticatedSession } from './auth';

test.describe('Alert system uses modal', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('delete confirmation uses a modal instead of window.confirm', async ({ page }) => {
    let nativeConfirmOpened = false;
    page.on('dialog', () => {
      nativeConfirmOpened = true;
    });

    await page.goto('/tenant/t1/orders');
    await expect(page.getByText('Engine Spare Parts Q1')).toBeVisible();

    await page.getByTestId('requisition-delete-1').click();
    const dialog = page.getByTestId('app-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Delete requisition' })).toBeVisible();
    await expect(dialog.getByText(/Engine Spare Parts Q1/)).toBeVisible();

    await page.getByTestId('app-dialog-cancel').click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText('Engine Spare Parts Q1')).toBeVisible();

    await page.getByTestId('requisition-delete-1').click();
    await page.getByTestId('app-dialog-confirm').click();
    await expect(page.getByText('Engine Spare Parts Q1')).toHaveCount(0);
    expect(nativeConfirmOpened).toBe(false);
  });
});
