import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test('el usuario puede eliminar una postulación', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  // ARRANGE: creamos un job a través del Page Object
  await dashboard.addJob({
    company: 'Microsoft',
    position: 'Backend Developer',
    date: '2026-08-01',
  });

  const microsoftCard = dashboard.getJobCard('Microsoft');
  await expect(microsoftCard).toBeVisible();

  // ACT: eliminamos la postulación usando el método encapsulado del Page Object
  await dashboard.deleteJob('Microsoft');

  // ASSERT: la card ya no debe existir
  await expect(microsoftCard).not.toBeVisible();
});