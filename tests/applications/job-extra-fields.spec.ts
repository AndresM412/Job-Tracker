import { test, expect } from "@playwright/test";
import { setupAuthenticatedSession } from "../helpers";
import { DashboardPage } from "../pages/DashboardPage";

test.describe("Campos Adicionales, Prioridad In-Situ, Mapa y Filtros", () => {
  test.beforeEach(async ({ page, request }) => {
    await setupAuthenticatedSession(page, request);
  });

  test("permite registrar link de vacante (con normalización segura), localidad y modalidad, y los muestra en Cards, Tabla y Detalle", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Verificar bloqueo de URL insegura (XSS) en el formulario antes de enviar
    await dashboard.openAddApplication();
    await dashboard.companyInput.fill("Shopify");
    await dashboard.positionInput.fill("QA Automation Engineer");
    await dashboard.dateInput.fill("2026-11-11");
    await dashboard.jobUrlInput.fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Add Job" }).click();
    await expect(page.getByTestId("job-url-error")).toBeVisible();
    await expect(dashboard.jobFormView).toBeVisible();

    // Corregir con dominio sin protocolo para validar normalización automática a https://
    await dashboard.locationInput.fill("Toronto, Canada");
    await dashboard.selectWorkMode("Hybrid");
    await dashboard.jobUrlInput.fill("careers.shopify.com/jobs/42");
    await page.getByRole("button", { name: "Add Job" }).click();
    await expect(dashboard.jobFormView).not.toBeVisible();

    // 1. Verificar en Card view
    const card = dashboard.getJobCard("Shopify");
    await expect(card).toBeVisible();
    await expect(card).toContainText("Toronto, Canada");
    await expect(card.getByTestId("work-mode-badge")).toHaveText(/Hybrid/i);
    const cardLink = card.getByTestId("card-job-url-link");
    await expect(cardLink).toHaveAttribute(
      "href",
      "https://careers.shopify.com/jobs/42",
    );
    await expect(cardLink).toHaveAttribute("target", "_blank");
    await expect(cardLink).toHaveAttribute("rel", /noopener noreferrer/);

    // 2. Verificar en Table view
    await dashboard.switchToTableView();
    const row = dashboard.getJobCard("Shopify");
    await expect(row).toBeVisible();
    await expect(row).toContainText("Toronto, Canada");
    await expect(row.getByTestId("work-mode-badge")).toHaveText(/Hybrid/i);
    await expect(row.getByTestId("table-job-url-link")).toHaveAttribute(
      "href",
      "https://careers.shopify.com/jobs/42",
    );

    // 3. Verificar en JobDetailView
    await row.click();
    await expect(dashboard.jobDetailView).toBeVisible();
    await expect(page.getByTestId("detail-location-text")).toHaveText(
      "Toronto, Canada",
    );
    const detailLink = page.getByTestId("detail-job-url-link");
    await expect(detailLink).toHaveAttribute(
      "href",
      "https://careers.shopify.com/jobs/42",
    );
    await expect(detailLink).toContainText("careers.shopify.com");
  });

  test("permite calificar prioridad (0–5 estrellas) in-situ en tarjeta y detalle con persistencia tras recargar", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Linear",
      position: "SDET",
      date: "2026-11-11",
    });

    // Verificar que inicia en 0 estrellas sin estar en el formulario
    const card = dashboard.getJobCard("Linear");
    await expect(card.getByTestId("card-star-1")).toHaveAttribute(
      "data-active",
      "false",
    );

    // Calificar con 4 estrellas directo en la tarjeta sin abrir la vista detalle (stopPropagation)
    await dashboard.setPriorityOnCard("Linear", 4);
    await expect(dashboard.jobDetailView).not.toBeVisible();
    await expect(card.getByTestId("card-star-4")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(card.getByTestId("card-star-5")).toHaveAttribute(
      "data-active",
      "false",
    );

    // Abrir detalle y comprobar que refleja 4 estrellas y que son estáticas (deshabilitadas)
    await dashboard.openJobDetail("Linear");
    await expect(page.getByTestId("detail-priority-star-4")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.getByTestId("detail-priority-star-5")).toHaveAttribute(
      "data-active",
      "false",
    );
    await expect(page.getByTestId("detail-priority-star-4")).toBeDisabled();

    // Regresar a la lista de aplicaciones
    await dashboard.backToApplicationsButton.click();

    // Volver a hacer clic en la 4ta estrella en la tarjeta para limpiar a 0 estrellas
    await dashboard.setPriorityOnCard("Linear", 4);
    await expect(card.getByTestId("card-star-1")).toHaveAttribute(
      "data-active",
      "false",
    );

    // Cambiar a vista de tabla y calificar con 5 estrellas directamente en la tabla
    await dashboard.switchToTableView();
    await dashboard.setPriorityInTable("Linear", 5);
    await expect(
      dashboard.getJobCard("Linear").getByTestId("table-star-5"),
    ).toHaveAttribute("data-active", "true");

    // Recargar para confirmar persistencia en PostgreSQL
    await page.reload();
    await expect(
      dashboard.getJobCard("Linear").getByTestId("table-star-5"),
    ).toHaveAttribute("data-active", "true");

    // También reflejado en las cards
    await dashboard.switchToGridView();
    await expect(
      dashboard.getJobCard("Linear").getByTestId("card-star-5"),
    ).toHaveAttribute("data-active", "true");

    // Y en el detalle se visualiza estáticamente
    await dashboard.openJobDetail("Linear");
    await expect(page.getByTestId("detail-priority-star-5")).toHaveAttribute(
      "data-active",
      "true",
    );
    await expect(page.getByTestId("detail-priority-star-5")).toBeDisabled();
  });

  test("filtra exactamente por estrellas de prioridad y combina filtros de modalidad y localidad", async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Vercel",
      position: "QA Engineer",
      date: "2026-11-11",
      location: "Toronto, Canada",
      workMode: "Remote",
    });
    await dashboard.addJob({
      company: "GitLab",
      position: "Test Architect",
      date: "2026-11-11",
      location: "Montreal, Canada",
      workMode: "Hybrid",
    });
    await dashboard.addJob({
      company: "Rappi",
      position: "QA Lead",
      date: "2026-11-11",
      location: "Bogotá, Colombia",
      workMode: "On-site",
    });

    await dashboard.setPriorityOnCard("Vercel", 5);
    await dashboard.setPriorityOnCard("GitLab", 4);
    // Rappi permanece con 0 estrellas (Unrated)

    // 1. Filtro exacto por 5 estrellas
    await dashboard.filterByPriority(5);
    await expect(dashboard.getJobCard("Vercel")).toBeVisible();
    await expect(dashboard.getJobCard("GitLab")).not.toBeVisible();
    await expect(dashboard.getJobCard("Rappi")).not.toBeVisible();

    // 2. Filtro exacto por 4 estrellas (no incluye las de 5)
    await dashboard.filterByPriority(4);
    await expect(dashboard.getJobCard("GitLab")).toBeVisible();
    await expect(dashboard.getJobCard("Vercel")).not.toBeVisible();

    // 3. Filtro por Unrated (0 estrellas)
    await dashboard.filterByPriority(0);
    await expect(dashboard.getJobCard("Rappi")).toBeVisible();
    await expect(dashboard.getJobCard("GitLab")).not.toBeVisible();

    // Restablecer prioridad a All
    await dashboard.filterByPriority("all");
    await expect(dashboard.getJobCard("Vercel")).toBeVisible();
    await expect(dashboard.getJobCard("GitLab")).toBeVisible();
    await expect(dashboard.getJobCard("Rappi")).toBeVisible();

    // 4. Filtro por Localidad ("Canada") + Modalidad ("Hybrid")
    await dashboard.filterByLocation("Canada");
    await expect(dashboard.getJobCard("Vercel")).toBeVisible();
    await expect(dashboard.getJobCard("GitLab")).toBeVisible();
    await expect(dashboard.getJobCard("Rappi")).not.toBeVisible();

    await dashboard.filterByWorkMode("Hybrid");
    await expect(dashboard.getJobCard("GitLab")).toBeVisible();
    await expect(dashboard.getJobCard("Vercel")).not.toBeVisible();
  });

  test("permite buscar y guardar coordenadas de oficina en el mapa (mock de Nominatim), persistir en backend y abrir Google Maps", async ({
    page,
  }) => {
    // Interceptar peticiones externas a Nominatim para que el test sea 100% determinista en CI
    await page.route(
      "https://nominatim.openstreetmap.org/**",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              place_id: 999123,
              display_name:
                "Google Colombia, Carrera 11 # 84-09, Bogotá, Colombia",
              lat: "4.6682",
              lon: "-74.0537",
            },
          ]),
        });
      },
    );

    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Google",
      position: "Software Engineer in Test",
      date: "2026-11-11",
      location: "Bogotá, Colombia",
      workMode: "Hybrid",
    });

    await dashboard.openJobDetail("Google");
    await expect(page.getByTestId("open-office-map-btn")).toContainText(
      "Pin Office",
    );

    // Abrir modal del mapa y buscar usando el mock de Nominatim
    await page.getByTestId("open-office-map-btn").click();
    await expect(page.getByTestId("office-map-modal")).toBeVisible();
    await page.getByTestId("office-search-submit-btn").click();

    // Seleccionar el resultado mockeado
    const firstResult = page.getByTestId("office-search-result-0");
    await expect(firstResult).toContainText(
      "Google Colombia, Carrera 11 # 84-09",
    );
    await firstResult.click();

    // Verificar visor interactivo Leaflet, marcador SVG, coordenadas y link oficial a Google Maps
    const leafletMap = page.getByTestId("office-leaflet-map");
    await expect(leafletMap).toBeVisible();
    await expect(leafletMap).toHaveAttribute("data-lat", "4.6682");
    await expect(leafletMap).toHaveAttribute("data-lng", "-74.0537");
    await expect(leafletMap.locator(".office-leaflet-pin")).toBeVisible();
    await expect(page.getByTestId("office-map-modal")).toContainText(
      "4.6682, -74.0537",
    );
    await expect(page.getByTestId("open-google-maps-link")).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=4.6682,-74.0537",
    );

    // Verificar toggle de tema oscuro/claro en el mapa Leaflet
    const themeToggle = page.getByTestId("toggle-map-theme-btn");
    await expect(themeToggle).toContainText("Light Map");
    await themeToggle.click();
    await expect(themeToggle).toContainText("Dark Map");

    // Guardar pin en PostgreSQL real vía PATCH
    await page.getByTestId("save-office-btn").click();
    await expect(page.getByTestId("office-map-modal")).not.toBeVisible();
    await expect(page.getByTestId("open-office-map-btn")).toContainText(
      "View Office Map",
    );

    // Recargar página y comprobar persistencia cacheada en DB sin volver a consultar Nominatim
    await page.reload();
    await dashboard.openJobDetail("Google");
    await expect(page.getByTestId("open-office-map-btn")).toContainText(
      "View Office Map",
    );
    await page.getByTestId("open-office-map-btn").click();
    const persistedMap = page.getByTestId("office-leaflet-map");
    await expect(persistedMap).toHaveAttribute("data-lat", "4.6682");
    await expect(persistedMap).toHaveAttribute("data-lng", "-74.0537");

    // Limpiar pin guardado
    await page.getByTestId("clear-office-btn").click();
    await expect(page.getByTestId("office-map-modal")).not.toBeVisible();
    await expect(page.getByTestId("open-office-map-btn")).toContainText(
      "Pin Office",
    );
  });

  test("mantiene diseño responsivo sin desbordamiento horizontal en móvil (375x812)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: "Atlassian Corp",
      position: "Senior QA Automation Specialist",
      date: "2026-11-11",
      location: "Sydney, Australia",
      workMode: "Remote",
      jobUrl: "https://www.atlassian.com/company/careers/details/12345",
    });

    // 1. Verificar sin desbordamiento horizontal en vista lista (Cards)
    const listOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(listOverflow).toBe(false);
    await expect(page.getByLabel("Open navigation menu")).toBeVisible();

    // 2. Verificar sin desbordamiento horizontal en JobDetailView
    await dashboard.openJobDetail("Atlassian Corp");
    await expect(dashboard.jobDetailView).toBeVisible();
    const detailOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(detailOverflow).toBe(false);
    await expect(page.getByTestId("detail-job-url-link")).toBeVisible();
    await expect(page.getByTestId("open-office-map-btn")).toBeVisible();
  });
});
