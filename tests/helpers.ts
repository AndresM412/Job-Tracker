import { type APIRequestContext, type Page } from '@playwright/test';

const API_URL = 'http://127.0.0.1:8000';

export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'password123';

  // 1. Intentar registrar al usuario de pruebas por si no existe aún
  await request.post(`${API_URL}/register`, {
    data: { email, password },
  });

  // 2. Iniciar sesión para obtener el token JWT (usando OAuth2 Form Data)
  const response = await request.post(`${API_URL}/login`, {
    form: {
      username: email,
      password: password,
    },
  });

  const data = await response.json();
  return data.access_token;
}

export async function clearAllJobs(request: APIRequestContext) {
  const token = await getAuthToken(request);

  const response = await request.get(`${API_URL}/jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const jobs = await response.json();

  if (Array.isArray(jobs)) {
    for (const job of jobs) {
      await request.delete(`${API_URL}/jobs/${job.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }
}

export async function setupAuthenticatedSession(page: Page, request: APIRequestContext) {
  const token = await getAuthToken(request);
  const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';

  // Inyectar el token en el localStorage del navegador antes de navegar a la página
  await page.addInitScript(
    ({ token, email }) => {
      window.localStorage.setItem('job_tracker_token', token);
      window.localStorage.setItem('job_tracker_user_email', email);
    },
    { token, email }
  );

  // Limpiar todos los trabajos previos del usuario
  await clearAllJobs(request);
}