import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test('el usuario puede agregar una nueva postulación', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  // ACT: Llenamos y enviamos el formulario a través del Page Object
  await dashboard.addJob({
    company: 'Google',
    position: 'Frontend Developer',
    date: '2026-08-01',
  });

  // ASSERT: Verificamos el resultado en pantalla usando el Page Object
  const googleCard = dashboard.getJobCard('Google');
  await expect(googleCard).toBeVisible();
  await expect(googleCard.getByText('Frontend Developer')).toBeVisible();
  await expect(dashboard.getStatusBadge(googleCard)).toHaveText('Applied');
});