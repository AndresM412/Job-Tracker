import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('el usuario puede eliminar una postulación', async ({ page }) => {
  // ARRANGE: primero creamos un job para poder borrarlo después
  await page.getByPlaceholder('Company', { exact: true }).fill('Microsoft');
  await page.getByPlaceholder('Position', { exact: true }).fill('Backend Developer');
  await page.locator('input[type="date"]').fill('2026-08-01');
  await page.getByRole('button', { name: 'Add Job' }).click();

  // Confirmamos que sí se creó, antes de intentar borrarlo
  await expect(page.getByText('Microsoft')).toBeVisible();

  // ACT: hacemos clic en Delete
  await page.getByRole('button', { name: 'Delete' }).click();

  // ASSERT: la card ya no debe existir
  await expect(page.getByText('Microsoft')).not.toBeVisible();
});