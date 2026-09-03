import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
  await page.goto('/');
});

test('el usuario puede agregar una nueva postulación', async ({ page }) => {
  // ACT: llenar el formulario
  await page.getByPlaceholder('Company', {exact: true}).fill('Google');
  await page.getByPlaceholder('Position', {exact: true}).fill('Frontend Developer');
  await page.locator('input[type="date"]').fill('2026-08-01');
  await page.getByRole('button', { name: 'Add Job' }).click();

  // ASSERT: la card nueva debe aparecer con esos datos
  await expect(page.getByText('Google')).toBeVisible();
  await expect(page.getByText('Frontend Developer')).toBeVisible();
});