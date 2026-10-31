import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';

test.describe('Landing Page y Flujos de Navegación', () => {
  test('un visitante nuevo ve la landing page con información clave y botones en la esquina', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();

    // ASSERT: elementos clave del header y corner buttons
    await expect(landing.loginButton).toBeVisible();
    await expect(landing.loginButton).toHaveText('Log In');
    await expect(landing.registerButton).toBeVisible();
    await expect(landing.registerButton).toHaveText('Sign Up');

    // ASSERT: barra de navegación modular con las 3 pestañas
    await expect(landing.overviewTab).toBeVisible();
    await expect(landing.sandboxTab).toBeVisible();
    await expect(landing.howItWorksTab).toBeVisible();

    // ASSERT: titular principal en la pestaña Overview
    await expect(page.getByRole('heading', { name: /The focused workspace to organize your job applications/i })).toBeVisible();

    // ACT: cambiar a la pestaña Live Sandbox para explorar el workspace interactivo
    await landing.switchTab('sandbox');

    // ASSERT: tarjetas de demostración visibles en el sandbox
    await expect(landing.getDemoCard('Google')).toBeVisible();
    await expect(landing.getDemoCard('Stripe')).toBeVisible();
    await expect(landing.getDemoCard('Spotify')).toBeVisible();
  });

  test('el botón "Log In" en la esquina navega a /login', async ({ page }) => {
    const landing = new LandingPage(page);
    const auth = new AuthPage(page);
    await landing.goto();

    // ACT: clic en Log In en la esquina superior
    await landing.clickLogin();

    // ASSERT: URL actualizada a /login y vista de login activa
    await expect(page).toHaveURL(/\/login$/);
    await expect(auth.emailInput).toBeVisible();
    await expect(auth.passwordInput).toBeVisible();
    await expect(auth.loginButton).toHaveText('Log In');
  });

  test('el botón "Sign Up" en la esquina navega a /register', async ({ page }) => {
    const landing = new LandingPage(page);
    const auth = new AuthPage(page);
    await landing.goto();

    // ACT: clic en Sign Up en la esquina superior
    await landing.clickRegister();

    // ASSERT: URL actualizada a /register y modo registro activo
    await expect(page).toHaveURL(/\/register$/);
    await expect(auth.emailInput).toBeVisible();
    await expect(auth.passwordInput).toBeVisible();
    await expect(auth.confirmPasswordInput).toBeVisible();
    await expect(auth.registerButton).toHaveText('Create Account');
  });

  test('la flecha "Atrás" del navegador regresa a la landing page', async ({ page }) => {
    const landing = new LandingPage(page);
    const auth = new AuthPage(page);
    await landing.goto();

    // ACT: navegar a login y luego retroceder con el historial nativo del navegador
    await landing.clickLogin();
    await expect(page).toHaveURL(/\/login$/);
    await expect(auth.emailInput).toBeVisible();

    // Retroceder con la flecha del navegador
    await page.goBack();

    // ASSERT: la URL vuelve a la raíz y la landing se visualiza de nuevo
    await expect(page).toHaveURL(/\/$/);
    await expect(landing.loginButton).toBeVisible();
    await expect(landing.registerButton).toBeVisible();
    await expect(auth.emailInput).not.toBeVisible();
  });

  test('el botón CTA final "Create Free Account" lleva al registro', async ({ page }) => {
    const landing = new LandingPage(page);
    const auth = new AuthPage(page);
    await landing.goto();

    // ACT: clic en el botón principal CTA al final de la landing
    await landing.ctaRegisterButton.click();

    // ASSERT: formulario de registro abierto en /register
    await expect(page).toHaveURL(/\/register$/);
    await expect(auth.confirmPasswordInput).toBeVisible();
    await expect(auth.registerButton).toHaveText('Create Account');
  });
});
