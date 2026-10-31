import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Selector de Vista en Applications (Grid vs. Table)', () => {
  test.beforeEach(async ({ page, request }) => {
    await setupAuthenticatedSession(page, request);
  });

  test('por defecto arranca en vista de tarjetas (grid)', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.viewModeGridButton).toHaveAttribute('aria-pressed', 'true');
    await expect(dashboard.viewModeTableButton).toHaveAttribute('aria-pressed', 'false');
    await expect(dashboard.jobTable).not.toBeVisible();
  });

  test('el usuario puede alternar a vista de tabla y ver las postulaciones estructuradas', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'Datadog',
      position: 'QA Automation Engineer',
      date: '2026-08-15',
      status: 'Interview',
    });

    // Cambiar a vista de tabla
    await dashboard.switchToTableView();

    await expect(dashboard.viewModeTableButton).toHaveAttribute('aria-pressed', 'true');
    await expect(dashboard.viewModeGridButton).toHaveAttribute('aria-pressed', 'false');
    await expect(dashboard.jobTable).toBeVisible();

    const datadogRow = dashboard.getJobCard('Datadog');
    await expect(datadogRow).toBeVisible();
    await expect(datadogRow.getByText('Datadog')).toBeVisible();
    await expect(datadogRow.getByText('QA Automation Engineer')).toBeVisible();
    await expect(dashboard.getStatusBadge(datadogRow)).toHaveText(/Interview/i);
  });

  test('la preferencia de vista de tabla se persiste en localStorage al recargar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.switchToTableView();
    await expect(dashboard.jobTable).toBeVisible();

    await page.reload();

    await expect(dashboard.viewModeTableButton).toHaveAttribute('aria-pressed', 'true');
    await expect(dashboard.jobTable).toBeVisible();

    // Regresar a Grid y verificar persistencia
    await dashboard.switchToGridView();
    await expect(dashboard.jobTable).not.toBeVisible();
    await expect(dashboard.viewModeGridButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('hacer clic en una fila de la tabla abre la vista técnica detallada', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'GitHub',
      position: 'SDET Specialist',
      date: '2026-08-20',
      status: 'Applied',
    });

    await dashboard.switchToTableView();
    const githubRow = dashboard.getJobCard('GitHub');
    await githubRow.click();

    // Debe mostrar la vista detallada de la vacante
    await expect(page.getByTestId('job-detail-view')).toBeVisible();
    await expect(page.getByText('GitHub').first()).toBeVisible();
    await expect(page.getByText('SDET Specialist').first()).toBeVisible();
  });

  test('el usuario puede eliminar una postulación directamente desde la vista de tabla', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'Cloudflare',
      position: 'Platform Engineer',
      date: '2026-08-25',
    });

    await dashboard.switchToTableView();
    const cloudflareRow = dashboard.getJobCard('Cloudflare');
    await expect(cloudflareRow).toBeVisible();

    // Eliminar usando el Page Object
    await dashboard.deleteJob('Cloudflare');

    await expect(cloudflareRow).not.toBeVisible();
  });
});
