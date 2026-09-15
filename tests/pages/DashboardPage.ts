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

  // 3. Locators de Sesión
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Formulario de Job
    this.companyInput = page.getByPlaceholder('Company', { exact: true });
    this.positionInput = page.getByPlaceholder('Position', { exact: true });
    this.statusSelect = page.locator('select').first();
    this.dateInput = page.locator('input[type="date"]');
    this.notesInput = page.getByPlaceholder('Notes (optional)...');
    this.addJobButton = page.getByRole('button', { name: 'Add Job' });
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });

    // Controles de Filtrado y Ordenamiento
    this.searchInput = page.getByPlaceholder('Search by company, position, or status...');
    this.sortSelect = page.getByTestId('sort-control');

    // Sesión
    this.logoutButton = page.getByRole('button', { name: 'Cerrar Sesión' });
  }

  // --- Acciones de Navegación e Interacción ---

  async goto() {
    await this.page.goto('/');
  }

  async addJob(job: JobData) {
    await this.companyInput.fill(job.company);
    await this.positionInput.fill(job.position);
    await this.statusSelect.selectOption(job.status || 'Applied');
    await this.dateInput.fill(job.date);
    if (job.notes) {
      await this.notesInput.fill(job.notes);
    }
    await this.addJobButton.click();
  }

  getJobCard(company: string): Locator {
    return this.page.getByTestId(`job-card-${company}`);
  }

  async deleteJob(company: string) {
    const card = this.getJobCard(company);
    await card.getByRole('button', { name: 'Delete' }).click();
  }

  getStatusBadge(card: Locator): Locator {
    return card.getByTestId('status-badge');
  }

  async filterByStatus(status: string) {
    await this.page.getByRole('button', { name: status, exact: true }).click();
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
