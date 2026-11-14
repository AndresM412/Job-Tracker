import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../helpers';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Notas Modulares con Título (Roadmap Item 4)', () => {
  test.beforeEach(async ({ page, request }) => {
    await setupAuthenticatedSession(page, request);
  });

  test('el usuario puede agregar una nota modular desde la vista de detalle', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // 1. ARRANGE: Crear empleo de prueba
    await dashboard.addJob({
      company: 'Notion',
      position: 'QA Automation Engineer',
      date: '2026-11-04',
    });

    // 2. ACT: Abrir la vista de detalle del trabajo
    await dashboard.openJobDetail('Notion');
    await expect(dashboard.jobDetailView).toBeVisible();

    // Verificar estado vacío inicial de notas y que no se muestre el botón del header
    await expect(page.getByTestId('notes-empty-state')).toBeVisible();
    await expect(page.getByTestId('add-first-note-btn')).toBeVisible();
    await expect(page.getByTestId('add-note-btn')).not.toBeVisible();
    await expect(dashboard.notesCountBadge).toHaveText('0');

    // 3. ACT: Agregar primera nota usando el POM
    await dashboard.addNote(
      'HR Phone Screening',
      'Spoke with recruiter Sarah. Salary range is 4500 USD with full remote benefits.'
    );

    // 4. ASSERT: La tarjeta de la nota aparece en la lista con su título y contenido
    const noteCard = dashboard.getNoteCard('HR Phone Screening');
    await expect(noteCard).toBeVisible();
    await expect(noteCard).toContainText('Spoke with recruiter Sarah');
    await expect(dashboard.notesCountBadge).toHaveText('1');

    // Tras agregar la primera nota, el botón del header aparece y el empty state desaparece
    await expect(page.getByTestId('add-note-btn')).toBeVisible();
    await expect(page.getByTestId('notes-empty-state')).not.toBeVisible();
  });

  test('el usuario puede editar una nota modular existente', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // 1. ARRANGE: Crear empleo y abrir detalle
    await dashboard.addJob({
      company: 'Figma',
      position: 'Senior QA Engineer',
      date: '2026-11-04',
    });
    await dashboard.openJobDetail('Figma');

    // Agregar nota inicial
    await dashboard.addNote(
      'System Design Prep',
      'Topics: Playwright parallelization, worker isolation, and Docker compose.'
    );

    const noteCard = dashboard.getNoteCard('System Design Prep');
    await expect(noteCard).toBeVisible();

    // 2. ACT: Clic en editar nota
    await noteCard.getByTitle(/Edit note/i).click();
    await expect(dashboard.noteTitleInput).toBeVisible();
    await expect(dashboard.noteTitleInput).toHaveValue('System Design Prep');

    // Modificar título y contenido
    await dashboard.noteTitleInput.fill('Advanced System Design');
    await dashboard.noteContentInput.fill('Updated focus: Multi-tenant database partitioning and mock service workers.');
    await dashboard.noteSubmitButton.click();

    // 3. ASSERT: La nota refleja los datos actualizados
    await expect(dashboard.noteTitleInput).not.toBeVisible();
    const updatedNote = dashboard.getNoteCard('Advanced System Design');
    await expect(updatedNote).toBeVisible();
    await expect(updatedNote).toContainText('Updated focus: Multi-tenant database partitioning');
  });

  test('el usuario puede eliminar una nota individual con modal de confirmación consistente', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // 1. ARRANGE: Crear empleo, abrir detalle y agregar nota
    await dashboard.addJob({
      company: 'Canva',
      position: 'Frontend Tester',
      date: '2026-11-04',
    });
    await dashboard.openJobDetail('Canva');

    await dashboard.addNote('Draft Note', 'This note should be deleted.');
    const noteCard = dashboard.getNoteCard('Draft Note');
    await expect(noteCard).toBeVisible();
    await expect(dashboard.notesCountBadge).toHaveText('1');

    // 2. ACT: Clic en eliminar nota y verificar modal consistente
    await noteCard.getByTitle(/Delete note/i).click();
    await expect(page.getByTestId('confirm-delete-note-modal')).toBeVisible();
    await expect(page.locator('#confirm-delete-note-title')).toHaveText('Delete note?');

    // Confirmar eliminación
    await dashboard.confirmDeleteNoteButton.click();

    // 3. ASSERT: La nota desaparece y el estado vacío vuelve a mostrarse
    await expect(noteCard).not.toBeVisible();
    await expect(page.getByTestId('notes-empty-state')).toBeVisible();
    await expect(dashboard.notesCountBadge).toHaveText('0');
  });

  test('el usuario puede buscar notas por título y ver el detalle completo en el modal de lectura', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // 1. ARRANGE: Crear empleo y 2 notas con títulos distintos
    await dashboard.addJob({
      company: 'Datadog',
      position: 'Test Architect',
      date: '2026-11-04',
    });
    await dashboard.openJobDetail('Datadog');

    await dashboard.addNote('HR Benefits Summary', 'Detailed discussion on healthcare, 401k matching, and relocation.');
    await dashboard.addNote('Technical Interview Loop', 'Coding challenge on asynchronous streams and Playwright locators.');

    // 2. ACT: Filtrar por título usando el buscador
    const searchInput = page.getByTestId('search-notes-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Technical');

    // 3. ASSERT: Solo la nota correspondiente coincide en pantalla
    await expect(dashboard.getNoteCard('Technical Interview Loop')).toBeVisible();
    await expect(dashboard.getNoteCard('HR Benefits Summary')).not.toBeVisible();

    // Limpiar búsqueda
    await page.getByTitle('Clear search').click();
    await expect(dashboard.getNoteCard('HR Benefits Summary')).toBeVisible();

    // 4. ACT: Clic en cualquier parte de la tarjeta no abre el modal; solo el botón 'Read note' lo abre
    await dashboard.getNoteCard('Technical Interview Loop').click();
    const detailModal = page.getByTestId('note-detail-modal');
    await expect(detailModal).not.toBeVisible();

    await dashboard.getNoteCard('Technical Interview Loop').getByRole('button', { name: /Read note/i }).click();
    await expect(detailModal).toBeVisible();
    await expect(detailModal).toContainText('Coding challenge on asynchronous streams');

    // Probar transición in-situ a modo edición dentro del mismo modal
    await page.getByTestId('modal-edit-note-btn').click();
    await expect(dashboard.noteTitleInput).toBeVisible();
    await expect(dashboard.noteTitleInput).toHaveValue('Technical Interview Loop');

    // Cancelar edición in-situ y verificar que regresa a modo lectura sin cerrar el modal
    await dashboard.noteCancelButton.click();
    await expect(dashboard.noteTitleInput).not.toBeVisible();
    await expect(detailModal).toContainText('Coding challenge on asynchronous streams');

    // Cerrar modal de lectura usando la "X" accesible del header
    await detailModal.getByRole('button', { name: 'Close dialog' }).click();
    await expect(detailModal).not.toBeVisible();
  });

  test('las notas persisten en el backend al recargar la página', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // 1. ARRANGE: Crear empleo y agregar nota
    await dashboard.addJob({
      company: 'Linear',
      position: 'Automation Lead',
      date: '2026-11-04',
    });
    await dashboard.openJobDetail('Linear');
    await dashboard.addNote('Offer Discussion', 'Expected equity grant and sign-on bonus details.');

    // 2. ACT: Recargar la página
    await page.reload();

    // 3. ASSERT: Abrir nuevamente el detalle y verificar persistencia
    await dashboard.openJobDetail('Linear');
    await expect(dashboard.jobDetailView).toBeVisible();
    const noteCard = dashboard.getNoteCard('Offer Discussion');
    await expect(noteCard).toBeVisible();
    await expect(noteCard).toContainText('Expected equity grant and sign-on bonus');
    await expect(dashboard.notesCountBadge).toHaveText('1');
  });

  test('el usuario puede agregar y actualizar la descripción de la vacante inline con límite y modal de lectura', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.addJob({
      company: 'Stripe',
      position: 'Staff QA Engineer',
      date: '2026-11-04',
    });
    await dashboard.openJobDetail('Stripe');
    await expect(dashboard.jobDetailView).toBeVisible();

    // Estado inicial: único botón para agregar descripción en el cuerpo
    const addDescBtn = page.getByRole('button', { name: 'Add Description' });
    await expect(addDescBtn).toBeVisible();
    await addDescBtn.click();

    // Rellenar descripción y verificar contador de caracteres (3000 max)
    const descTextarea = page.getByPlaceholder(/paste or write the job description/i);
    await expect(descTextarea).toBeVisible();
    await expect(page.getByText(/\/ 3000/)).toBeVisible();

    const longDescription =
      'Design and architect fault-tolerant payment gateway integration tests using Playwright and TypeScript. Lead test automation initiatives across distributed backend microservices and maintain continuous integration pipelines.';
    await descTextarea.fill(longDescription);
    await page.getByRole('button', { name: 'Save' }).click();

    // Verificar que se visualiza la descripción recortada y el disparador Read more
    await expect(page.getByText('Design and architect fault-tolerant payment gateway')).toBeVisible();
    const readMoreBtn = page.getByRole('button', { name: /Read more/i });
    await expect(readMoreBtn).toBeVisible();

    // Clic en Read more para abrir el modal de lectura
    await readMoreBtn.click();
    const descModal = page.getByTestId('job-description-modal');
    await expect(descModal).toBeVisible();
    await expect(descModal).toContainText('Design and architect fault-tolerant payment gateway');

    // Probar transición in-situ a modo edición dentro del mismo modal
    await page.getByTestId('modal-edit-description-btn').click();
    await expect(descTextarea).toBeVisible();

    // Cancelar y verificar que regresa a modo lectura sin cerrar el modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(descTextarea).not.toBeVisible();
    await expect(descModal).toContainText('Design and architect fault-tolerant payment gateway');

    // Cerrar modal usando la "X" accesible del header
    await descModal.getByRole('button', { name: 'Close dialog' }).click();
    await expect(descModal).not.toBeVisible();

    // Verificar que el header muestra únicamente el botón 'Update'
    const updateBtn = page.getByTestId('edit-description-btn');
    await expect(updateBtn).toContainText('Update');
    await updateBtn.click();
    await expect(descTextarea).toBeVisible();
  });
});
