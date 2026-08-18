import { test, expect } from "@playwright/test";
import { clearAllJobs } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await clearAllJobs(request);
  await page.goto('/');
});

test("el usuario puede eliminar una postulación específica entre varias", async ({
  page,
}) => {
  // ARRANGE: creamos 3 jobs distintos
  const jobs = [
    { company: "Microsoft", position: "Backend Developer" },
    { company: "Google", position: "Frontend Developer" },
    { company: "Amazon", position: "DevOps Engineer" },
  ];

  for (const job of jobs) {
    await page.getByPlaceholder("Company", { exact: true }).fill(job.company);
    await page.getByPlaceholder("Position", { exact: true }).fill(job.position);
    await page.locator('input[type="date"]').fill("2026-08-01");
    await page.getByRole("button", { name: "Add Job" }).click();
  }

  // Confirmamos que los 3 existen
  await expect(page.getByText("Microsoft")).toBeVisible();
  await expect(page.getByText("Google")).toBeVisible();
  await expect(page.getByText("Amazon")).toBeVisible();

  // ACT: buscamos SOLO la card que contiene "Google", y dentro de ella, su botón Delete
  const googleCard = page.getByTestId("job-card-Google");
  await googleCard.getByRole("button", { name: "Delete" }).click();

  // ASSERT: Google desapareció, pero los otros dos siguen ahí
  await expect(page.getByText("Google", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Microsoft", { exact: true })).toBeVisible();
  await expect(page.getByText("Amazon", { exact: true })).toBeVisible();
});
