import { type Page, type Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly ctaRegisterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByTestId('landing-login-btn');
    this.registerButton = page.getByTestId('landing-register-btn');
    this.ctaRegisterButton = page.getByTestId('cta-register-btn');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickRegister() {
    await this.registerButton.click();
  }
}
