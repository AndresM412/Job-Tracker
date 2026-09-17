import { test, expect } from "@playwright/test";
import { setupAuthenticatedSession } from "./helpers";
import { DashboardPage } from "./pages/DashboardPage";

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test("el filtro muestra TODAS las postulaciones que coinciden con el status", async ({
  page,
}) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  // ARRANGE: la lista de jobs es la única fuente de verdad
  const jobs = [
    {
      company: "Microsoft",
      position: "Backend Developer",
      status: "Applied",
      date: "2026-08-01",
    },
    {
      company: "Google",
      position: "Frontend Developer",
      status: "Applied",
      date: "2026-08-02",
    },
    {
      company: "Amazon",
      position: "DevOps Engineer",
      status: "Interview",
      date: "2026-08-03",
    },
    {
      company: "Netflix",
      position: "QA Engineer",
      status: "Offer",
      date: "2026-08-04",
    },
  ];

  for (const job of jobs) {
    await dashboard.addJob(job);
    await expect(dashboard.getJobCard(job.company)).toBeVisible();
  }

  // Calculamos cuántos jobs deberían coincidir con "Applied", a partir del array
  const statusToFilter = "Applied";
  const expectedCount = jobs.filter(
    (job) => job.status === statusToFilter,
  ).length;

  // ACT: filtramos usando el Page Object
  await dashboard.filterByStatus(statusToFilter);

  // ASSERT: el número de badges de estado visibles debe coincidir con lo que calculamos
  const appliedMessages = page.getByTestId("status-badge").filter({ hasText: "Applied" });
  await expect(appliedMessages).toHaveCount(expectedCount);

  // Verificamos también que sean justo los correctos (no otros por casualidad)
  const matchingJobs = jobs.filter((job) => job.status === statusToFilter);
  for (const job of matchingJobs) {
    await expect(dashboard.getJobCard(job.company)).toBeVisible();
  }

  const nonMatchingJobs = jobs.filter((job) => job.status !== statusToFilter);
  for (const job of nonMatchingJobs) {
    await expect(dashboard.getJobCard(job.company)).not.toBeVisible();
  }
});

test('el filtro "All" muestra todas las postulaciones sin importar el status', async ({
  page,
}) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  await dashboard.addJob({
    company: "Microsoft",
    position: "Backend Developer",
    status: "Applied",
    date: "2026-08-01",
  });
  await dashboard.addJob({
    company: "Google",
    position: "Frontend Developer",
    status: "Applied",
    date: "2026-08-02",
  });
  await dashboard.addJob({
    company: "Amazon",
    position: "DevOps Engineer",
    status: "Interview",
    date: "2026-08-03",
  });

  // Filtramos primero por algo específico
  await dashboard.filterByStatus("Interview");
  await expect(dashboard.getJobCard("Microsoft")).not.toBeVisible();

  // ACT: volvemos a "All" a través del Page Object
  await dashboard.filterByStatus("All");

  // ASSERT: los 3 vuelven a verse
  await expect(dashboard.getJobCard("Microsoft")).toBeVisible();
  await expect(dashboard.getJobCard("Google")).toBeVisible();
  await expect(dashboard.getJobCard("Amazon")).toBeVisible();
});
