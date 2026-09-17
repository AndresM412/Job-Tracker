import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test('el usuario puede buscar postulaciones por texto', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  // 1. ARRANGE: Creamos 3 jobs con fechas y estados específicos
  const jobs = [
    { company: 'Microsoft', position: 'Backend Developer', status: 'Applied', date: '2026-08-01' },
    { company: 'Google', position: 'Frontend Developer', status: 'Interview', date: '2026-08-02' },
    { company: 'Amazon', position: 'Frontend Engineer', status: 'Offer', date: '2026-08-03' },
  ];

  for (const job of jobs) {
    await dashboard.addJob(job);
    await expect(dashboard.getJobCard(job.company)).toBeVisible();
  }

  // 2. ACT: Buscamos "Frontend" usando el Page Object
  const searchQuery = 'Frontend';
  await dashboard.search(searchQuery);

  // 3. ASSERT: Los que coinciden (Google y Amazon) deben verse
  await expect(dashboard.getJobCard('Google')).toBeVisible();
  await expect(dashboard.getJobCard('Amazon')).toBeVisible();

  // Y el que no coincide (Microsoft) no debe verse
  await expect(dashboard.getJobCard('Microsoft')).not.toBeVisible();
});

test('la búsqueda sin coincidencias muestra el mensaje de vacío', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  // ARRANGE: Creamos un job
  await dashboard.addJob({
    company: 'Microsoft',
    position: 'Backend Developer',
    status: 'Applied',
    date: '2026-08-01',
  });

  // ACT: Buscamos un texto que sabemos que no existe
  await dashboard.search('Netflix');

  // ASSERT: La card desaparece y se muestra el mensaje de lista vacía
  await expect(dashboard.getJobCard('Microsoft')).not.toBeVisible();
  await expect(page.getByText('No applications match this filter.')).toBeVisible();
});