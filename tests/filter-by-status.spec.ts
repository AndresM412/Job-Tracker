import { test, expect, type Page } from '@playwright/test';
import { clearAllJobs } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await clearAllJobs(request);
  await page.goto('/');
});

async function addJob(page: Page, company: string, position: string, status: string, date: string) {
  await page.getByPlaceholder('Company', { exact: true }).fill(company);
  await page.getByPlaceholder('Position', { exact: true }).fill(position);
  await page.locator('select').first().selectOption(status);
  await page.locator('input[type="date"]').fill(date);
  await page.getByRole('button', { name: 'Add Job' }).click();
}

test('el filtro muestra TODAS las postulaciones que coinciden con el status', async ({ page }) => {
  // ARRANGE: la lista de jobs es la única fuente de verdad
  const jobs = [
    { company: 'Microsoft', position: 'Backend Developer', status: 'Applied', date: '2026-08-01' },
    { company: 'Google', position: 'Frontend Developer', status: 'Applied', date: '2026-08-02' },
    { company: 'Amazon', position: 'DevOps Engineer', status: 'Interview', date: '2026-08-03' },
    { company: 'Netflix', position: 'QA Engineer', status: 'Offer', date: '2026-08-04' },
  ];

  for (const job of jobs) {
    await addJob(page, job.company, job.position, job.status, job.date);
  }

  // Confirmamos que todos existen antes de filtrar
  for (const job of jobs) {
    await expect(page.getByTestId(`job-card-${job.company}`)).toBeVisible();
  }

  // Calculamos cuántos jobs deberían coincidir con "Applied", a partir del array
  const statusToFilter = 'Applied';
  const expectedCount = jobs.filter((job) => job.status === statusToFilter).length;

  // ACT: filtramos
  await page.getByRole('button', { name: statusToFilter, exact: true }).click();

  // ASSERT: el número de mensajes visibles debe coincidir con lo que calculamos, no con un número fijo
  const appliedMessages = page.getByText('Application Applied!');
  await expect(appliedMessages).toHaveCount(expectedCount);

  // Verificamos también que sean justo los correctos (no otros por casualidad)
  const matchingJobs = jobs.filter((job) => job.status === statusToFilter);
  for (const job of matchingJobs) {
    await expect(page.getByTestId(`job-card-${job.company}`)).toBeVisible();
  }

  const nonMatchingJobs = jobs.filter((job) => job.status !== statusToFilter);
  for (const job of nonMatchingJobs) {
    await expect(page.getByTestId(`job-card-${job.company}`)).not.toBeVisible();
  }
});

test('el filtro "All" muestra todas las postulaciones sin importar el status', async ({ page }) => {
  await addJob(page, 'Microsoft', 'Backend Developer', 'Applied', '2026-08-01');
  await addJob(page, 'Google', 'Frontend Developer', 'Applied', '2026-08-02');
  await addJob(page, 'Amazon', 'DevOps Engineer', 'Interview', '2026-08-03');

  // Filtramos primero por algo específico
  await page.getByRole('button', { name: 'Interview', exact: true }).click();
  await expect(page.getByTestId('job-card-Microsoft')).not.toBeVisible();

  // ACT: volvemos a "All"
  await page.getByRole('button', { name: 'All', exact: true }).click();

  // ASSERT: los 3 vuelven a verse
  await expect(page.getByTestId('job-card-Microsoft')).toBeVisible();
  await expect(page.getByTestId('job-card-Google')).toBeVisible();
  await expect(page.getByTestId('job-card-Amazon')).toBeVisible();
});