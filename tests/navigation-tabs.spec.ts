import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Navegación Global entre Vistas (Command Center Tabs)', () => {
  test.beforeEach(async ({ page, request }) => {
    await setupAuthenticatedSession(page, request);
  });

  test('por defecto arranca en la pestaña Applications con el panel principal visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ASSERT: La pestaña Applications está activa
    await expect(dashboard.applicationsTab).toHaveAttribute('aria-selected', 'true');
    await expect(dashboard.calendarTab).toHaveAttribute('aria-selected', 'false');
    await expect(dashboard.companiesTab).toHaveAttribute('aria-selected', 'false');

    // ASSERT: Los componentes de aplicaciones están visibles
    await expect(dashboard.addJobButton).toBeVisible();
    await expect(dashboard.searchInput).toBeVisible();

    // ASSERT: Las vistas placeholder no están visibles
    await expect(dashboard.calendarPlaceholder).not.toBeVisible();
    await expect(dashboard.companiesPlaceholder).not.toBeVisible();
  });

  test('el usuario puede alternar a la pestaña Interview Calendar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ACT: cambiar a Calendar
    await dashboard.switchToCalendar();

    // ASSERT: Pestaña activa y vista correspondiente mostrada
    await expect(dashboard.calendarTab).toHaveAttribute('aria-selected', 'true');
    await expect(dashboard.applicationsTab).toHaveAttribute('aria-selected', 'false');
    await expect(dashboard.calendarPlaceholder).toBeVisible();

    // ASSERT: El panel de applications se oculta
    await expect(dashboard.addJobButton).not.toBeVisible();
    await expect(dashboard.searchInput).not.toBeVisible();
  });

  test('el usuario puede alternar a la pestaña Target Companies & Search Hub', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ACT: cambiar a Target Companies
    await dashboard.switchToCompanies();

    // ASSERT: Pestaña activa y vista correspondiente mostrada
    await expect(dashboard.companiesTab).toHaveAttribute('aria-selected', 'true');
    await expect(dashboard.applicationsTab).toHaveAttribute('aria-selected', 'false');
    await expect(dashboard.companiesPlaceholder).toBeVisible();

    // ASSERT: El panel de applications se oculta
    await expect(dashboard.addJobButton).not.toBeVisible();
    await expect(dashboard.searchInput).not.toBeVisible();
  });

  test('el usuario puede regresar a Applications sin perder el estado', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ARRANGE: agregar una postulación
    await dashboard.addJob({
      company: 'Canva',
      position: 'Frontend Specialist',
      status: 'Applied',
      date: '2026-10-01',
    });

    const canvaCard = dashboard.getJobCard('Canva');
    await expect(canvaCard).toBeVisible();

    // ACT: ir a Target Hub y luego regresar a Applications
    await dashboard.switchToCompanies();
    await expect(dashboard.companiesPlaceholder).toBeVisible();
    await expect(canvaCard).not.toBeVisible();

    await dashboard.switchToApplications();

    // ASSERT: la tarjeta de Canva sigue existiendo intacta
    await expect(dashboard.applicationsTab).toHaveAttribute('aria-selected', 'true');
    await expect(canvaCard).toBeVisible();
  });
});
