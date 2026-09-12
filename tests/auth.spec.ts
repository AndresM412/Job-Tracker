import { test, expect } from '@playwright/test';

test.describe('Flujos de Autenticación E2E', () => {
  test('el usuario puede registrarse desde la UI y acceder al dashboard', async ({ page }) => {
    await page.goto('/');

    // 1. Cambiar al modo de Registro
    await page.getByRole('button', { name: '¿No tienes cuenta? Regístrate aquí' }).click();

    // 2. Generar credenciales únicas para evitar colisiones
    const uniqueEmail = `qa_user_${Date.now()}@example.com`;
    const password = 'Password123!';

    // 3. Llenar los campos de registro
    await page.getByPlaceholder('tu@email.com').fill(uniqueEmail);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('input[type="password"]').nth(1).fill(password);

    // 4. Enviar el formulario
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // 5. Aserciones: el usuario debe ingresar al dashboard
    await expect(page.getByRole('button', { name: 'Cerrar Sesión' })).toBeVisible();
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test('el usuario puede iniciar sesión con credenciales válidas', async ({ page, request }) => {
    // Asegurar que el usuario de pruebas exista en el backend
    const email = `login_user_${Date.now()}@example.com`;
    const password = 'Password123!';

    await request.post('http://127.0.0.1:8000/register', {
      data: { email, password },
    });

    await page.goto('/');

    // Llenar formulario de login
    await page.getByPlaceholder('tu@email.com').fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Aserción: debe acceder al dashboard
    await expect(page.getByRole('button', { name: 'Cerrar Sesión' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test('muestra mensaje de error cuando las credenciales son incorrectas', async ({ page }) => {
    await page.goto('/');

    // Intentar login con contraseña errónea
    await page.getByPlaceholder('tu@email.com').fill('fake_user@example.com');
    await page.locator('input[type="password"]').first().fill('wrong_password_123');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Aserción: debe mostrarse la alerta de error y seguir en la pantalla de login
    await expect(page.getByText(/Incorrect email or password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar Sesión' })).not.toBeVisible();
  });

  test('el usuario puede cerrar sesión y volver a la pantalla de login', async ({ page, request }) => {
    // Registrar usuario temporal para esta prueba
    const email = `logout_user_${Date.now()}@example.com`;
    const password = 'Password123!';

    await request.post('http://127.0.0.1:8000/register', {
      data: { email, password },
    });

    await page.goto('/');

    // Iniciar sesión
    await page.getByPlaceholder('tu@email.com').fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Confirmar que estamos en el dashboard
    await expect(page.getByRole('button', { name: 'Cerrar Sesión' })).toBeVisible();

    // ACT: Hacer clic en "Cerrar Sesión"
    await page.getByRole('button', { name: 'Cerrar Sesión' }).click();

    // ASSERT: Debe volver a la pantalla de login
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar Sesión' })).not.toBeVisible();

    // ASSERT: El token de localStorage debe haber sido eliminado
    const token = await page.evaluate(() => localStorage.getItem('job_tracker_token'));
    expect(token).toBeNull();
  });

  test('redirige a login y muestra aviso cuando el token expira o es inválido (401)', async ({ page }) => {
    // 1. Inyectar un token corrupto o expirado antes de navegar
    await page.addInitScript(() => {
      window.localStorage.setItem('job_tracker_token', 'token_invalido_expirado_123');
      window.localStorage.setItem('job_tracker_user_email', 'expirado@example.com');
    });

    // 2. Navegar a la raíz
    await page.goto('/');

    // 3. ASSERT: Debe expulsar al usuario y mostrar el mensaje de sesión expirada
    await expect(
      page.getByText('Tu sesión ha expirado por inactividad. Por favor, vuelve a iniciar sesión.')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar Sesión' })).not.toBeVisible();

    // 4. ASSERT: El token inválido debe haber sido purgado de localStorage
    const token = await page.evaluate(() => localStorage.getItem('job_tracker_token'));
    expect(token).toBeNull();
  });
});
