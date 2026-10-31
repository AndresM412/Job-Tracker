import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test.describe('Ordenamiento de Postulaciones (SortControl)', () => {
  test('ordena por defecto por más recientemente agregada (LIFO) y permite ordenar por fecha de postulación', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // 1. ARRANGE: Crear 3 postulaciones donde el orden de creación es distinto al orden de fechas de postulación:
    // - AlphaCorp: Creada primero, pero con fecha futura (2026-12-31)
    // - BetaCorp: Creada segunda, pero con fecha pasada (2026-01-01)
    // - GammaCorp: Creada de última (la más reciente), con fecha intermedia (2026-06-15)
    const jobs = [
      { company: 'AlphaCorp', position: 'DevOps Engineer', status: 'Applied', date: '2026-12-31' },
      { company: 'BetaCorp', position: 'Backend Developer', status: 'Interview', date: '2026-01-01' },
      { company: 'GammaCorp', position: 'Frontend Developer', status: 'Offer', date: '2026-06-15' },
    ];

    for (const job of jobs) {
      await dashboard.addJob(job);
    }

    const companyHeadings = page.locator('[data-testid^="job-card-"] h2');

    // 2. ASSERT 1: Orden por defecto es "Recently added" (LIFO: GammaCorp -> BetaCorp -> AlphaCorp)
    await expect(companyHeadings).toHaveText(['GammaCorp', 'BetaCorp', 'AlphaCorp']);

    // 3. ACT 1: Cambiar el orden a "Application date: Newest"
    await dashboard.sortBy('newest');

    // 4. ASSERT 2: Orden ahora es por fecha de postulación descendente (AlphaCorp [Dic] -> GammaCorp [Jun] -> BetaCorp [Ene])
    await expect(companyHeadings).toHaveText(['AlphaCorp', 'GammaCorp', 'BetaCorp']);

    // 5. ACT 2: Cambiar el orden a "Application date: Oldest"
    await dashboard.sortBy('oldest');

    // 6. ASSERT 3: Orden ahora es por fecha de postulación ascendente (BetaCorp [Ene] -> GammaCorp [Jun] -> AlphaCorp [Dic])
    await expect(companyHeadings).toHaveText(['BetaCorp', 'GammaCorp', 'AlphaCorp']);

    // 7. ACT 3: Volver a "Recently added"
    await dashboard.sortBy('recently_added');

    // 8. ASSERT 4: Vuelve a quedar la más recientemente agregada de primera (GammaCorp -> BetaCorp -> AlphaCorp)
    await expect(companyHeadings).toHaveText(['GammaCorp', 'BetaCorp', 'AlphaCorp']);

    // 9. ASSERT 5: Persistencia LIFO desde el backend tras recargar la página
    await page.reload();
    await expect(companyHeadings).toHaveText(['GammaCorp', 'BetaCorp', 'AlphaCorp']);
  });
});
