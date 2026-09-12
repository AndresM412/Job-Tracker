import { test, expect, type Page } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
  await page.goto('/');
});

async function addJob(
  page: Page,
  company: string,
  position: string,
  date: string
) {
  await page.getByPlaceholder('Company', { exact: true }).fill(company);
  await page.getByPlaceholder('Position', { exact: true }).fill(position);
  await page.locator('input[type="date"]').fill(date);
  await page.getByRole('button', { name: 'Add Job' }).click();
  await expect(page.getByTestId(`job-card-${company}`)).toBeVisible();
}

test.describe('Ordenamiento de Postulaciones (SortControl)', () => {
  test('ordena las postulaciones por fecha: Newest first y Oldest first', async ({ page }) => {
    // 1. ARRANGE: Crear 3 postulaciones con fechas distintas
    await addJob(page, 'Google', 'Frontend Developer', '2026-01-15');
    await addJob(page, 'Microsoft', 'Backend Developer', '2026-06-20');
    await addJob(page, 'Amazon', 'DevOps Engineer', '2026-11-10');

    // Locator que selecciona el título de la empresa en cada card
    const companyHeadings = page.locator('[data-testid^="job-card-"] h2');

    // 2. ASSERT 1: Orden por defecto es "Newest first" (Amazon -> Microsoft -> Google)
    await expect(companyHeadings).toHaveText(['Amazon', 'Microsoft', 'Google']);

    // 3. ACT 1: Cambiar el orden a "Oldest first"
    await page.getByTestId('sort-control').selectOption('oldest');

    // 4. ASSERT 2: Orden ahora debe ser de la más antigua a la más reciente (Google -> Microsoft -> Amazon)
    await expect(companyHeadings).toHaveText(['Google', 'Microsoft', 'Amazon']);

    // 5. ACT 2: Volver a cambiar a "Newest first"
    await page.getByTestId('sort-control').selectOption('newest');

    // 6. ASSERT 3: Vuelve a quedar la más reciente de primera (Amazon -> Microsoft -> Google)
    await expect(companyHeadings).toHaveText(['Amazon', 'Microsoft', 'Google']);
  });
});
