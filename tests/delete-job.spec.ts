import { test, expect } from '@playwright/test';
import { clearAllJobs } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await clearAllJobs(request);
  await page.goto('/');
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