import { test, expect } from "@playwright/test";
import { setupAuthenticatedSession } from "./helpers";
import { DashboardPage } from "./pages/DashboardPage";

test.describe("Flujo Unificado Master-Detail a Pantalla Completa", () => {
  test.beforeEach(async ({ page, request }) => {
    await setupAuthenticatedSession(page, request);
  });

  test('el botón "+ Add Application" abre el formulario a pantalla completa y "Cancel" regresa a la lista sin crear postulación', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ACT: abrir formulario de creación desde el header
    await dashboard.openAddApplication();

    // ASSERT: vista de formulario unificada a pantalla completa visible
    await expect(dashboard.jobFormView).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stage New Application" }),
    ).toBeVisible();
    await expect(dashboard.companyInput).toBeVisible();
    await expect(dashboard.positionInput).toBeVisible();
    await expect(dashboard.statusSelect).toBeVisible();
    await expect(dashboard.dateInput).toBeVisible();
    await expect(dashboard.backToApplicationsButton).toBeVisible();

    // ACT: cancelar la creación
    await dashboard.formCancelButton.click();

    // ASSERT: formulario cerrado, de vuelta a la lista (toolbar visible) y sin registros creados
    await expect(dashboard.jobFormView).not.toBeVisible();
    await expect(dashboard.searchInput).toBeVisible();
    await expect(
      page.getByText("No applications match this filter."),
    ).toBeVisible();
  });

  test('el botón "Back to Applications" en creación regresa a la lista', async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.openAddApplication();
    await expect(dashboard.jobFormView).toBeVisible();

    // Rellenar parcialmente y hacer clic en Back to Applications
    await dashboard.companyInput.fill("Temp Company");
    await dashboard.backToApplicationsButton.click();

    // Debe regresar a la lista sin registrar la postulación
    await expect(dashboard.jobFormView).not.toBeVisible();
    await expect(dashboard.searchInput).toBeVisible();
    await expect(dashboard.getJobCard("Temp Company")).not.toBeVisible();
  });

  test("al editar desde el detalle a pantalla completa, cancelar regresa al detalle y guardar persiste los cambios", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ARRANGE: crear empleo inicial
    await dashboard.addJob({
      company: "Figma",
      position: "Product Designer",
      status: "Interview",
      date: "2026-08-15",
      notes: "Initial phone screen passed.",
    });

    // ACT 1: abrir detalle de la vacante haciendo clic en la tarjeta
    await dashboard.openJobDetail("Figma");
    await expect(dashboard.jobDetailView).toBeVisible();
    await expect(page.getByRole("heading", { name: "Figma" })).toBeVisible();
    await expect(page.getByText("Product Designer").first()).toBeVisible();

    // ACT 2: hacer clic en Edit dentro de la vista de detalle
    await dashboard.detailEditButton.click();
    await expect(dashboard.jobFormView).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Edit Application: Figma" }),
    ).toBeVisible();
    await expect(dashboard.companyInput).toHaveValue("Figma");
    await expect(dashboard.positionInput).toHaveValue("Product Designer");

    // ACT 3: cancelar edición y verificar que regrese al detalle intacto
    await dashboard.formCancelButton.click();
    await expect(dashboard.jobFormView).not.toBeVisible();
    await expect(dashboard.jobDetailView).toBeVisible();

    // ACT 4: volver a editar, cambiar el cargo y guardar
    await dashboard.detailEditButton.click();
    await expect(dashboard.jobFormView).toBeVisible();
    await dashboard.positionInput.fill("Lead Product Designer");
    await dashboard.saveChangesButton.click();

    // ASSERT: regresa a la vista de detalle con los datos actualizados
    await expect(dashboard.jobFormView).not.toBeVisible();
    await expect(dashboard.jobDetailView).toBeVisible();
    await expect(page.getByText("Lead Product Designer").first()).toBeVisible();
  });

  test("eliminar desde la vista de detalle muestra el modal de confirmación y al confirmar regresa a la lista", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ARRANGE: crear empleo
    await dashboard.addJob({
      company: "Datadog",
      position: "Site Reliability Engineer",
      status: "Offer",
      date: "2026-08-18",
    });

    // ACT 1: abrir detalle
    await dashboard.openJobDetail("Datadog");
    await expect(dashboard.jobDetailView).toBeVisible();

    // ACT 2: hacer clic en Delete dentro del detalle
    await dashboard.detailDeleteButton.click();

    // ASSERT 1: se abre el modal de confirmación con los datos del empleo
    await expect(dashboard.deleteModal).toBeVisible();
    await expect(dashboard.deleteModal).toContainText("Datadog");
    await expect(dashboard.deleteModal).toContainText(
      "Site Reliability Engineer",
    );

    // ACT 3: cancelar eliminación
    await dashboard.cancelDelete();
    await expect(dashboard.deleteModal).not.toBeVisible();
    await expect(dashboard.jobDetailView).toBeVisible();

    // ACT 4: volver a pulsar Delete y confirmar
    await dashboard.detailDeleteButton.click();
    await expect(dashboard.deleteModal).toBeVisible();
    await dashboard.confirmDelete();

    // ASSERT 2: el modal se cierra, se sale del detalle a la lista y la tarjeta ya no existe
    await expect(dashboard.deleteModal).not.toBeVisible();
    await expect(dashboard.jobDetailView).not.toBeVisible();
    await expect(dashboard.searchInput).toBeVisible();
    await expect(dashboard.getJobCard("Datadog")).not.toBeVisible();
  });
});
