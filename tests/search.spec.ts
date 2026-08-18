import { test, expect, type Page } from '@playwright/test';
import { clearAllJobs } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await clearAllJobs(request);
  await page.goto('/');
});

async function addJob(page: Page, company: string, position: string, date: string) {
  await page.getByPlaceholder('Company', { exact: true }).fill(company);
  await page.getByPlaceholder('Position', { exact: true }).fill(position);
  await page.locator('input[type="date"]').fill(date);
  await page.getByRole('button', { name: 'Add Job' }).click();
}

test('el usuario puede buscar postulaciones por texto', async ({ page }) => {
  // ARRANGE
  const jobs = [
    { company: 'Microsoft', position: 'Backend Developer', date: '2026-08-01' },
    { company: 'Google', position: 'Frontend Developer', date: '2026-08-02' },
    { company: 'Amazon', position: 'Frontend Engineer', date: '2026-08-03' },
  ];

  for (const job of jobs) {
    await addJob(page, job.company, job.position, job.date);
  }

  for (const job of jobs) {
    await expect(page.getByTestId(`job-card-${job.company}`)).toBeVisible();
  }

  // Calculamos qué jobs deberían coincidir con la búsqueda, a partir de los datos mismos
  const searchQuery = 'Frontend';
  const matchingJobs = jobs.filter((job) =>
    job.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const nonMatchingJobs = jobs.filter((job) =>
    !job.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ACT
  await page.getByPlaceholder('Search by company, position, or status...').fill(searchQuery);

  // ASSERT: los que coinciden deben verse
  for (const job of matchingJobs) {
    await expect(page.getByTestId(`job-card-${job.company}`)).toBeVisible();
  }

  // ASSERT: los que no coinciden, no deben verse
  for (const job of nonMatchingJobs) {
    await expect(page.getByTestId(`job-card-${job.company}`)).not.toBeVisible();
  }
});

test('la búsqueda sin coincidencias muestra el mensaje de vacío', async ({ page }) => {
  await addJob(page, 'Microsoft', 'Backend Developer', '2026-08-01');

  // ACT: buscamos algo que sabemos que no existe en ningún campo
  await page.getByPlaceholder('Search by company, position, or status...').fill('Netflix');

  // ASSERT
  await expect(page.getByTestId('job-card-Microsoft')).not.toBeVisible();
  await expect(page.getByText('No applications match this filter.')).toBeVisible();
});