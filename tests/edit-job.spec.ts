import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test('el usuario puede editar una postulación existente', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  // 1. ARRANGE: Creamos el job inicial con status 'Applied' explícito
  await dashboard.addJob({
    company: 'Netflix',
    position: 'QA Engineer',
    status: 'Applied',
    date: '2026-08-01',
  });

  const netflixCard = dashboard.getJobCard('Netflix');
  await expect(netflixCard).toBeVisible();

  // 2. ACT 1: Hacemos clic en Edit usando el método del Page Object
  await dashboard.clickEditJob('Netflix');

  // 3. ASSERT 1: El form se rellena con los datos actuales
  await expect(dashboard.companyInput).toHaveValue('Netflix');
  await expect(dashboard.positionInput).toHaveValue('QA Engineer');
  await expect(dashboard.statusSelect).toHaveValue('Applied');
  await expect(dashboard.saveChangesButton).toBeVisible();

  // 4. ACT 2: Cambiamos puesto y estado a 'Interview', luego guardamos
  await dashboard.positionInput.fill('Senior QA Engineer');
  await dashboard.statusSelect.selectOption('Interview');
  await dashboard.saveChangesButton.click();

  // 5. ASSERT 2: El cambio se refleja en la card
  await expect(netflixCard.getByText('Senior QA Engineer')).toBeVisible();
  await expect(netflixCard.getByText('QA Engineer', { exact: true })).not.toBeVisible();
  await expect(dashboard.getStatusBadge(netflixCard)).toHaveText('Interview');
  await expect(dashboard.addJobButton).toBeVisible();
});
