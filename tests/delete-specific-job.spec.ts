import { test, expect } from "@playwright/test";
import { setupAuthenticatedSession } from "./helpers";
import { DashboardPage } from "./pages/DashboardPage";

test.beforeEach(async ({ page, request }) => {
  await setupAuthenticatedSession(page, request);
});

test("el usuario puede eliminar una postulación específica entre varias", async ({
  page,
}) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  const jobs = [
    { company: "Microsoft", position: "Backend Developer", status: "Applied", date: "2026-08-01" },
    { company: "Google", position: "Frontend Developer", status: "Interview", date: "2026-08-02" },
    { company: "Amazon", position: "DevOps Engineer", status: "Offer", date: "2026-08-03" },
  ];

  for (const job of jobs) {
    await dashboard.addJob({
      company: job.company,
      position: job.position,
      status: job.status,
      date: job.date,
    });
  }

  // Confirmamos que los 3 existen y que Google tiene su badge correcto
  const googleCard = dashboard.getJobCard("Google");
  const microsoftCard = dashboard.getJobCard("Microsoft");
  const amazonCard = dashboard.getJobCard("Amazon");

  await expect(microsoftCard).toBeVisible();
  await expect(googleCard).toBeVisible();
  await expect(amazonCard).toBeVisible();
  await expect(dashboard.getStatusBadge(googleCard)).toHaveText("Interview");

  // ACT: eliminamos SOLO Google a través del Page Object
  await dashboard.deleteJob("Google");

  // ASSERT: Google desapareció, pero Microsoft y Amazon siguen ahí
  await expect(googleCard).not.toBeVisible();
  await expect(microsoftCard).toBeVisible();
  await expect(amazonCard).toBeVisible();
});
