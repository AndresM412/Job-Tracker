import { test, expect } from "@playwright/test";
import { setupAuthenticatedSession } from "../helpers";
import { DashboardPage } from "../pages/DashboardPage";

test.describe("Timeline de Etapas con Fechas (Roadmap Item 6)", () => {
  test.beforeEach(async ({ page, request }) => {
    await setupAuthenticatedSession(page, request);
  });

  test("crea automáticamente el hito inicial Applied al registrar una postulación y lo muestra en el timeline", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "GitLab",
      position: "Software Engineer in Test",
      date: "2026-11-20",
    });

    await dashboard.openJobDetail("GitLab");
    await expect(dashboard.jobDetailView).toBeVisible();

    // 1. Verificar presencia de la sección Timeline & Milestones en Overview
    const timelineSection = page.getByTestId("job-timeline-section");
    await expect(timelineSection).toBeVisible();
    await expect(page.getByTestId("timeline-count-badge")).toHaveText("1");

    // 2. Verificar el hito inicial autogenerado
    await expect(timelineSection).toContainText("Applied");
    await expect(timelineSection).toContainText("Nov 20, 2026");
    await expect(timelineSection).toContainText("Application submitted");
    await expect(timelineSection).toContainText("Current Stage");
  });

  test("permite agregar un nuevo hito mediante el modal y mantiene orden cronológico", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Atlassian",
      position: "QA Automation Specialist",
      date: "2026-11-15",
    });
    await dashboard.openJobDetail("Atlassian");

    // Abrir modal de nuevo hito
    await page.getByTestId("add-timeline-milestone-btn").click();
    const modal = page.getByTestId("timeline-event-modal");
    await expect(modal).toBeVisible();

    // Seleccionar etapa Interview, fecha posterior y notas descriptivas
    await page.getByTestId("timeline-stage-option-interview").click();
    await page.getByTestId("timeline-event-date-input").fill("2026-11-22");
    await page.getByTestId("timeline-event-notes-input").fill("Live coding loop with Staff Engineer");
    await page.getByTestId("timeline-event-submit-btn").click();

    // El modal se cierra y el conteo sube a 2
    await expect(modal).not.toBeVisible();
    await expect(page.getByTestId("timeline-count-badge")).toHaveText("2");

    // Verificar contenido del nuevo hito
    const timelineSection = page.getByTestId("job-timeline-section");
    await expect(timelineSection).toContainText("Interview");
    await expect(timelineSection).toContainText("Nov 22, 2026");
    await expect(timelineSection).toContainText("Live coding loop with Staff Engineer");
  });

  test("permite editar la fecha y notas de un hito y valida la persistencia al recargar", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Datadog",
      position: "Senior QA Architect",
      date: "2026-11-10",
    });
    await dashboard.openJobDetail("Datadog");

    // Agregar hito inicial de entrevista
    await page.getByTestId("add-timeline-milestone-btn").click();
    const modal = page.getByTestId("timeline-event-modal");
    await page.getByTestId("timeline-stage-option-interview").click();
    await page.getByTestId("timeline-event-date-input").fill("2026-11-18");
    await page.getByTestId("timeline-event-notes-input").fill("Initial recruiter screening");
    await page.getByTestId("timeline-event-submit-btn").click();
    await expect(modal).not.toBeVisible();

    // Editar el hito creado
    const editBtn = page.getByRole("button", { name: /Edit milestone Interview/i });
    await expect(editBtn).toBeVisible();
    await editBtn.click();
    await expect(modal).toBeVisible();

    // Modificar fecha y notas
    await page.getByTestId("timeline-event-date-input").fill("2026-11-25");
    await page.getByTestId("timeline-event-notes-input").fill("Rescheduled technical interview with VP");
    await page.getByTestId("timeline-event-submit-btn").click();
    await expect(modal).not.toBeVisible();

    // Verificar en pantalla antes de recargar
    const timelineSection = page.getByTestId("job-timeline-section");
    await expect(timelineSection).toContainText("Nov 25, 2026");
    await expect(timelineSection).toContainText("Rescheduled technical interview with VP");

    // Recargar página para asegurar persistencia en backend
    await page.reload();
    await dashboard.openJobDetail("Datadog");
    await expect(timelineSection).toContainText("Nov 25, 2026");
    await expect(timelineSection).toContainText("Rescheduled technical interview with VP");
  });

  test("permite navegar a la pestaña Timeline dedicada a pantalla completa", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Spotify",
      position: "Automation Engineer",
      date: "2026-11-01",
    });
    await dashboard.openJobDetail("Spotify");

    // Clic en la pestaña Timeline del header
    const timelineTab = page.getByTestId("tab-timeline");
    await expect(timelineTab).toBeVisible();
    await timelineTab.click();

    // Verificar que el timeline se visualiza en la pestaña dedicada
    const timelineSection = page.getByTestId("job-timeline-section");
    await expect(timelineSection).toBeVisible();
    await expect(timelineSection).toContainText("Applied");
    await expect(timelineSection).toContainText("Nov 1, 2026");
  });

  test("trunca notas largas en vista previa, aplica límite de 500 caracteres y abre modal de detalle con edición in-situ", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Cloudflare",
      position: "QA Platform Engineer",
      date: "2026-11-05",
    });
    await dashboard.openJobDetail("Cloudflare");

    await page.getByTestId("add-timeline-milestone-btn").click();
    const modal = page.getByTestId("timeline-event-modal");
    await expect(modal).toBeVisible();

    // Verificar contador de límite de 500 caracteres
    const notesInput = page.getByTestId("timeline-event-notes-input");
    const charCount = page.getByTestId("timeline-notes-char-count");
    await expect(charCount).toHaveText("0 / 500");
    await expect(notesInput).toHaveAttribute("maxlength", "500");

    const longMilestoneNote =
      "Completed 4-hour onsite system design and Playwright framework architecture loop with the core platform engineering team, covering distributed tracing, flaky test isolation, CI sharding, and cross-browser telemetry.";
    await page.getByTestId("timeline-stage-option-interview").click();
    await page.getByTestId("timeline-event-date-input").fill("2026-11-19");
    await notesInput.fill(longMilestoneNote);
    await expect(charCount).toHaveText(`${longMilestoneNote.length} / 500`);

    await page.getByTestId("timeline-event-submit-btn").click();
    await expect(modal).not.toBeVisible();

    // Verificar botón Read more en la vista previa truncada y abrir modal de lectura
    const readMoreBtn = page.getByRole("button", { name: /Read more/i });
    await expect(readMoreBtn).toBeVisible();
    await readMoreBtn.click();

    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Details");
    await expect(modal).toContainText("CI sharding, and cross-browser telemetry.");

    // Conmutar in-situ a modo edición desde el modal de detalle
    const modalEditBtn = modal.getByTestId("modal-edit-timeline-btn");
    await expect(modalEditBtn).toBeVisible();
    await modalEditBtn.click();

    await expect(modal).toContainText("Editing");
    await expect(page.getByTestId("timeline-event-notes-input")).toHaveValue(longMilestoneNote);
  });

  test("deshabilita agregar más milestones al alcanzar el límite de 10", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Vercel",
      position: "QA Engineer",
      date: "2026-11-01",
    });

    // Obtener token e ID del job creado para poblar 9 hitos vía API rápidamente
    const token = await page.evaluate(() => localStorage.getItem("job_tracker_token"));
    const jobsRes = await page.request.get("http://127.0.0.1:8000/jobs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jobs = await jobsRes.json();
    const jobId = jobs.find((j: { company: string }) => j.company === "Vercel").id;

    for (let i = 2; i <= 10; i++) {
      const res = await page.request.post(`http://127.0.0.1:8000/jobs/${jobId}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          stage: "Interview",
          date: `2026-11-${String(i).padStart(2, "0")}`,
          notes: `Round ${i}`,
        },
      });
      expect(res.ok()).toBe(true);
    }

    await page.reload();
    await dashboard.openJobDetail("Vercel");

    await expect(page.getByTestId("timeline-count-badge")).toHaveText("10");
    await expect(page.getByTestId("timeline-limit-badge")).toHaveText("Max 10");
    await expect(page.getByTestId("add-timeline-milestone-btn")).toBeDisabled();
  });
});
