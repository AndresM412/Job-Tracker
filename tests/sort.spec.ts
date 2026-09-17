import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test.describe('Ordenamiento de Postulaciones (SortControl)', () => {
  test('ordena las postulaciones por fecha: Newest first y Oldest first', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // 1. ARRANGE: Crear 3 postulaciones con fechas y estados específicos
    const jobs = [
      { company: 'Google', position: 'Frontend Developer', status: 'Applied', date: '2026-01-15' },
      { company: 'Microsoft', position: 'Backend Developer', status: 'Interview', date: '2026-06-20' },
      { company: 'Amazon', position: 'DevOps Engineer', status: 'Offer', date: '2026-11-10' },
    ];

    for (const job of jobs) {
      await dashboard.addJob(job);
    }

    const companyHeadings = page.locator('[data-testid^="job-card-"] h2');

    // 2. ASSERT 1: Orden por defecto es "Newest first" (Amazon -> Microsoft -> Google)
    await expect(companyHeadings).toHaveText(['Amazon', 'Microsoft', 'Google']);

    // 3. ACT 1: Cambiar el orden a "Oldest first" usando el Page Object
    await dashboard.sortBy('oldest');

    // 4. ASSERT 2: Orden ahora es de la más antigua a la más reciente (Google -> Microsoft -> Amazon)
    await expect(companyHeadings).toHaveText(['Google', 'Microsoft', 'Amazon']);

    // 5. ACT 2: Volver a cambiar a "Newest first"
    await dashboard.sortBy('newest');

    // 6. ASSERT 3: Vuelve a quedar la más reciente de primera (Amazon -> Microsoft -> Google)
    await expect(companyHeadings).toHaveText(['Amazon', 'Microsoft', 'Google']);
  });
});
