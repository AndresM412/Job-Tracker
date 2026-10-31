import { type Page, type Locator } from '@playwright/test';

export interface JobData {
  company: string;
  position: string;
  status?: string;
  date: string;
  notes?: string;
}

export class DashboardPage {
  readonly page: Page;

  // 1. Locators del Formulario
  readonly companyInput: Locator;
  readonly positionInput: Locator;
  readonly statusSelect: Locator;
  readonly dateInput: Locator;
  readonly notesInput: Locator;
  readonly addJobButton: Locator;
  readonly saveChangesButton: Locator;

  // 2. Locators de Búsqueda, Filtros y Ordenamiento
  readonly searchInput: Locator;
  readonly sortSelect: Locator;
  readonly viewModeGridButton: Locator;
  readonly viewModeTableButton: Locator;
  readonly jobTable: Locator;

  // Modal de Confirmación de Eliminación
  readonly deleteModal: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;
  readonly deleteModalTitle: Locator;
  readonly deleteModalBackdrop: Locator;

  // 3. Locators de Navegación de Vistas
  readonly applicationsTab: Locator;
  readonly calendarTab: Locator;
  readonly companiesTab: Locator;
  readonly calendarPlaceholder: Locator;
  readonly companiesPlaceholder: Locator;

  // 4. Locators de Sesión
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Formulario de Job
    this.companyInput = page.getByPlaceholder('Company', { exact: true });
    this.positionInput = page.getByPlaceholder('Position', { exact: true });
    this.statusSelect = page.getByTestId('status-select');
    this.dateInput = page.locator('input[type="date"]');
    this.notesInput = page.getByPlaceholder(/Notes \(optional\)/i);
    this.addJobButton = page.getByRole('button', { name: /Add (Application|Job)/i });
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });

    // Controles de Filtrado y Ordenamiento
    this.searchInput = page.getByPlaceholder('Search by company, position, or status...');
    this.sortSelect = page.getByTestId('sort-control');
    this.viewModeGridButton = page.getByTestId('view-mode-grid');
    this.viewModeTableButton = page.getByTestId('view-mode-table');
    this.jobTable = page.getByTestId('job-table');

    // Modal de Confirmación de Eliminación
    this.deleteModal = page.getByRole('dialog');
    this.confirmDeleteButton = page.getByTestId('confirm-delete-btn');
    this.cancelDeleteButton = page.getByTestId('cancel-delete-btn');
    this.deleteModalTitle = page.locator('#confirm-delete-title');
    this.deleteModalBackdrop = page.getByTestId('confirm-delete-modal-backdrop');

    // Navegación de Pestañas
    this.applicationsTab = page.getByTestId('tab-applications');
    this.calendarTab = page.getByTestId('tab-calendar');
    this.companiesTab = page.getByTestId('tab-companies');
    this.calendarPlaceholder = page.getByTestId('view-calendar-placeholder');
    this.companiesPlaceholder = page.getByTestId('view-target-hub-placeholder');

    // Sesión
    this.logoutButton = page.getByRole('button', { name: 'Log Out' });
  }

  // --- Acciones de Navegación e Interacción ---

  async switchToApplications() {
    await this.applicationsTab.click();
  }

  async switchToCalendar() {
    await this.calendarTab.click();
  }

  async switchToCompanies() {
    await this.companiesTab.click();
  }

  async switchToGridView() {
    await this.viewModeGridButton.click();
  }

  async switchToTableView() {
    await this.viewModeTableButton.click();
  }

  async goto() {
    await this.page.goto('/');
  }

  async addJob(job: JobData) {
    if (!(await this.companyInput.isVisible())) {
      const openBtn = this.page.getByRole('button', { name: /Add Application/i });
      if (await openBtn.isVisible()) {
        await openBtn.click();
      }
    }
    await this.companyInput.fill(job.company);
    await this.positionInput.fill(job.position);
    await this.statusSelect.selectOption(job.status || 'Applied');
    await this.dateInput.fill(job.date);
    if (job.notes) {
      await this.notesInput.fill(job.notes);
    }
    await this.page.getByRole('button', { name: 'Add Job' }).click();
  }

  getJobCard(company: string): Locator {
    return this.page.getByTestId(`job-card-${company}`);
  }

  async clickDeleteJob(company: string) {
    const card = this.getJobCard(company);
    await card.getByRole('button', { name: 'Delete' }).click();
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click();
  }

  async deleteJob(company: string) {
    await this.clickDeleteJob(company);
    await this.confirmDelete();
  }

  async clickEditJob(company: string) {
    const card = this.getJobCard(company);
    await card.getByRole('button', { name: 'Edit' }).click();
  }

  getStatusBadge(card: Locator): Locator {
    return card.getByTestId('status-badge');
  }

  async filterByStatus(status: string) {
    const dropdownBtn = this.page.getByTestId('status-filter-dropdown-btn');
    if (await dropdownBtn.isVisible()) {
      await dropdownBtn.click();
      await this.page.getByTestId(`status-filter-option-${status.toLowerCase()}`).click();
    } else {
      await this.page.getByRole('button', { name: status, exact: true }).click();
    }
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async sortBy(order: 'newest' | 'oldest') {
    await this.sortSelect.selectOption(order);
  }

  async logout() {
    await this.logoutButton.click();
  }
}
