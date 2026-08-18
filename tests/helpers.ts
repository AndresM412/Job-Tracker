import { type APIRequestContext } from '@playwright/test';

const API_URL = 'http://127.0.0.1:8000';

export async function clearAllJobs(request: APIRequestContext) {
  const response = await request.get(`${API_URL}/jobs`);
  const jobs = await response.json();

  for (const job of jobs) {
    await request.delete(`${API_URL}/jobs/${job.id}`);
  }
}