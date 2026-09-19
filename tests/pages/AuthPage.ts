import { type Page, type Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;

  // Locators de Inputs
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;

  // Locators de Botones
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly switchToRegisterButton: Locator;
  readonly switchToLoginButton: Locator;

  // Alerta de Error
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByPlaceholder('tu@email.com');
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);

    this.loginButton = page.getByRole('button', { name: 'Iniciar Sesión' });
    this.registerButton = page.getByRole('button', { name: 'Crear Cuenta' });
    this.switchToRegisterButton = page.getByRole('button', { name: '¿No tienes cuenta? Regístrate aquí' });
    this.switchToLoginButton = page.getByRole('button', { name: '¿Ya tienes cuenta? Inicia sesión' });
    this.errorMessage = page.locator('.bg-rejected\\/10');
  }

  async goto() {
    await this.page.goto('/');
  }

  async switchToRegister() {
    await this.switchToRegisterButton.click();
  }

  async switchToLogin() {
    await this.switchToLoginButton.click();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async register(email: string, password: string, confirmPassword?: string) {
    await this.switchToRegister();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
    await this.registerButton.click();
  }
}
