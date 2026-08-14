import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('el usuario puede editar una postulación existente', async ({ page }) => {
  // ARRANGE: creamos un job para después editarlo
  await page.getByPlaceholder('Company', { exact: true }).fill('Netflix');
  await page.getByPlaceholder('Position', { exact: true }).fill('QA Engineer');
  await page.locator('input[type="date"]').fill('2026-08-01');
  await page.getByRole('button', { name: 'Add Job' }).click();

  await expect(page.getByText('Netflix')).toBeVisible();

  // ACT 1: hacemos clic en Edit dentro de la card de Netflix
  const netflixCard = page.getByTestId('job-card-Netflix');
  await netflixCard.getByRole('button', { name: 'Edit' }).click();

  // ASSERT 1: el form debe rellenarse con los datos actuales
  await expect(page.getByPlaceholder('Company', { exact: true })).toHaveValue('Netflix');
  await expect(page.getByPlaceholder('Position', { exact: true })).toHaveValue('QA Engineer');

  // El botón debe cambiar de texto en modo edición
  await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();

  // ACT 2: cambiamos el puesto y guardamos
  await page.getByPlaceholder('Position', { exact: true }).fill('Senior QA Engineer');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  // ASSERT 2: el cambio debe reflejarse, y el dato viejo ya no debe existir
  await expect(page.getByText('Senior QA Engineer')).toBeVisible();
  await expect(page.getByText('QA Engineer', { exact: true })).not.toBeVisible();

  // Y el botón debe volver a decir "Add Job" (salimos del modo edición)
  await expect(page.getByRole('button', { name: 'Add Job' })).toBeVisible();
});
