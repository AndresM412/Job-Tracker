import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Flujos de Autenticación E2E', () => {
  test('el usuario puede registrarse desde la UI y acceder al dashboard', async ({ page }) => {
    const auth = new AuthPage(page);
    const dashboard = new DashboardPage(page);

    await auth.goto();

    const uniqueEmail = `qa_user_${Date.now()}@example.com`;
    const password = 'Password123!';

    // ACT: registramos a través del Page Object
    await auth.register(uniqueEmail, password);

    // ASSERT: accede al dashboard
    await expect(dashboard.logoutButton).toBeVisible();
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test('el usuario puede iniciar sesión con credenciales válidas', async ({ page, request }) => {
    const auth = new AuthPage(page);
    const dashboard = new DashboardPage(page);

    const email = `login_user_${Date.now()}@example.com`;
    const password = 'Password123!';

    // Asegurar que el usuario de pruebas exista en el backend
    await request.post('http://127.0.0.1:8000/register', {
      data: { email, password },
    });

    await auth.goto();

    // ACT: iniciamos sesión a través del Page Object
    await auth.login(email, password);

    // ASSERT: accede al dashboard
    await expect(dashboard.logoutButton).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test('muestra mensaje de error cuando las credenciales son incorrectas', async ({ page }) => {
    const auth = new AuthPage(page);
    const dashboard = new DashboardPage(page);

    await auth.goto();

    // ACT: intento de login con credenciales erróneas
    await auth.login('fake_user@example.com', 'wrong_password_123');

    // ASSERT: alerta de error visible y seguimos en la pantalla de login
    await expect(auth.errorMessage).toContainText(/Incorrect email or password/i);
    await expect(auth.loginButton).toBeVisible();
    await expect(dashboard.logoutButton).not.toBeVisible();
  });

  test('el usuario puede cerrar sesión y volver a la pantalla de login', async ({ page, request }) => {
    const auth = new AuthPage(page);
    const dashboard = new DashboardPage(page);

    const email = `logout_user_${Date.now()}@example.com`;
    const password = 'Password123!';

    await request.post('http://127.0.0.1:8000/register', {
      data: { email, password },
    });

    await auth.goto();
    await auth.login(email, password);
    await expect(dashboard.logoutButton).toBeVisible();

    // ACT: cerrar sesión a través de DashboardPage
    await dashboard.logout();

    // ASSERT: vuelve a la pantalla de login
    await expect(auth.loginButton).toBeVisible();
    await expect(dashboard.logoutButton).not.toBeVisible();

    // ASSERT: el token de localStorage fue eliminado
    const token = await page.evaluate(() => localStorage.getItem('job_tracker_token'));
    expect(token).toBeNull();
  });

  test('redirige a login y muestra aviso cuando el token expira o es inválido (401)', async ({ page }) => {
    const auth = new AuthPage(page);
    const dashboard = new DashboardPage(page);

    // 1. Inyectar un token corrupto o expirado antes de navegar
    await page.addInitScript(() => {
      window.localStorage.setItem('job_tracker_token', 'token_invalido_expirado_123');
      window.localStorage.setItem('job_tracker_user_email', 'expirado@example.com');
    });

    // 2. Navegar a la raíz
    await auth.goto();

    // 3. ASSERT: aviso de sesión expirada y botones
    await expect(auth.errorMessage).toContainText(
      'Tu sesión ha expirado por inactividad. Por favor, vuelve a iniciar sesión.'
    );
    await expect(auth.loginButton).toBeVisible();
    await expect(dashboard.logoutButton).not.toBeVisible();

    // 4. ASSERT: el token inválido fue purgado de localStorage
    const token = await page.evaluate(() => localStorage.getItem('job_tracker_token'));
    expect(token).toBeNull();
  });
});
