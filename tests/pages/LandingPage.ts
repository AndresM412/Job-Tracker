import { type Page, type Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly ctaRegisterButton: Locator;
  readonly overviewTab: Locator;
  readonly sandboxTab: Locator;
  readonly howItWorksTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByTestId('landing-login-btn');
    this.registerButton = page.getByTestId('landing-register-btn');
    this.ctaRegisterButton = page.getByTestId('cta-register-btn');
    this.overviewTab = page.getByRole('navigation').getByRole('button', { name: 'Overview' });
    this.sandboxTab = page.getByRole('navigation').getByRole('button', { name: 'Live Sandbox' });
    this.howItWorksTab = page.getByRole('navigation').getByRole('button', { name: 'How It Works' });
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

  async switchTab(tab: 'overview' | 'sandbox' | 'workflow') {
    if (tab === 'overview') await this.overviewTab.click();
    if (tab === 'sandbox') await this.sandboxTab.click();
    if (tab === 'workflow') await this.howItWorksTab.click();
  }

  getDemoCard(company: string): Locator {
    return this.page.locator('#demo').getByRole('heading', { name: company, exact: true });
  }
}
