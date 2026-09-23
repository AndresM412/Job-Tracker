import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Modal de Confirmación de Eliminación', () => {
  test.beforeEach(async ({ page, request }) => {
    await setupAuthenticatedSession(page, request);
  });

  test('el modal muestra los datos del empleo y elimina la postulación al confirmar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // ARRANGE: crear postulación
    await dashboard.addJob({
      company: 'Netflix',
      position: 'Senior Frontend Engineer',
      status: 'Interview',
      date: '2026-08-15',
    });

    const netflixCard = dashboard.getJobCard('Netflix');
    await expect(netflixCard).toBeVisible();

    // ACT: hacer clic en Delete para abrir el modal
    await dashboard.clickDeleteJob('Netflix');

    // ASSERT: verificar presencia del modal y contenido descriptivo
    await expect(dashboard.deleteModal).toBeVisible();
    await expect(dashboard.deleteModal).toContainText('Netflix');
    await expect(dashboard.deleteModal).toContainText('Senior Frontend Engineer');

    // ACT: confirmar la eliminación
    await dashboard.confirmDelete();

    // ASSERT: el modal se cierra y la tarjeta ya no existe
    await expect(dashboard.deleteModal).not.toBeVisible();
    await expect(netflixCard).not.toBeVisible();
  });

  test('cancelar desde el botón cierra el modal y conserva la postulación intacta', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'Spotify',
      position: 'Mobile Engineer',
      status: 'Applied',
      date: '2026-08-10',
    });

    const spotifyCard = dashboard.getJobCard('Spotify');
    await expect(spotifyCard).toBeVisible();

    // ACT: abrir modal y cancelar
    await dashboard.clickDeleteJob('Spotify');
    await expect(dashboard.deleteModal).toBeVisible();
    await dashboard.cancelDelete();

    // ASSERT: el modal desaparece pero la postulación sigue en la lista
    await expect(dashboard.deleteModal).not.toBeVisible();
    await expect(spotifyCard).toBeVisible();
  });

  test('presionar la tecla Escape cierra el modal y no elimina la postulación (Accesibilidad)', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'Amazon',
      position: 'DevOps Engineer',
      status: 'Applied',
      date: '2026-08-05',
    });

    const amazonCard = dashboard.getJobCard('Amazon');
    await expect(amazonCard).toBeVisible();

    // ACT: abrir modal y presionar la tecla Escape en el teclado
    await dashboard.clickDeleteJob('Amazon');
    await expect(dashboard.deleteModal).toBeVisible();
    await page.keyboard.press('Escape');

    // ASSERT: modal cerrado y postulación preservada
    await expect(dashboard.deleteModal).not.toBeVisible();
    await expect(amazonCard).toBeVisible();
  });

  test('hacer clic en el fondo exterior (backdrop) cierra el modal sin eliminar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'Google',
      position: 'Site Reliability Engineer',
      status: 'Interview',
      date: '2026-08-01',
    });

    const googleCard = dashboard.getJobCard('Google');
    await expect(googleCard).toBeVisible();

    // ACT: abrir modal y hacer clic en una esquina del backdrop
    await dashboard.clickDeleteJob('Google');
    await expect(dashboard.deleteModal).toBeVisible();
    await dashboard.deleteModalBackdrop.click({ position: { x: 10, y: 10 } });

    // ASSERT: el modal se cierra y la postulación sigue existiendo
    await expect(dashboard.deleteModal).not.toBeVisible();
    await expect(googleCard).toBeVisible();
  });

  test('el modal expone los atributos de accesibilidad WAI-ARIA requeridos', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'Apple',
      position: 'iOS Developer',
      status: 'Applied',
      date: '2026-08-12',
    });

    await dashboard.clickDeleteJob('Apple');

    // ASSERT: validar atributos semánticos de diálogo
    await expect(dashboard.deleteModal).toBeVisible();
    await expect(dashboard.deleteModal).toHaveAttribute('role', 'dialog');
    await expect(dashboard.deleteModal).toHaveAttribute('aria-modal', 'true');
    await expect(dashboard.deleteModalTitle).toBeVisible();
  });
});
