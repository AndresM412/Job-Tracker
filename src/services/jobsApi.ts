import { type JobApplication } from "../types/job";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("job_tracker_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchJobs(): Promise<JobApplication[]> {
  const response = await fetch(`${API_URL}/jobs`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  const data = await response.json();
  return data.map(mapFromApi);
}

export async function createJob(job: Omit<JobApplication, "id">): Promise<JobApplication> {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(mapToApi(job)),
  });
  if (!response.ok) {
    throw new Error("Failed to create job");
  }
  const data = await response.json();
  return mapFromApi(data);
}

export async function updateJob(job: JobApplication): Promise<JobApplication> {
  const response = await fetch(`${API_URL}/jobs/${job.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(mapToApi(job)),
  });
  if (!response.ok) {
    throw new Error("Failed to update job");
  }
  const data = await response.json();
  return mapFromApi(data);
}

export async function deleteJob(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete job");
  }
}

// El backend usa snake_case (application_date), el frontend usa camelCase (applicationDate)
function mapFromApi(apiJob: any): JobApplication {
  return {
    id: apiJob.id,
    company: apiJob.company,
    position: apiJob.position,
    status: apiJob.status,
    applicationDate: apiJob.application_date,
    notes: apiJob.notes ?? undefined,
  };
}

function mapToApi(job: Omit<JobApplication, "id"> | JobApplication) {
  return {
    company: job.company,
    position: job.position,
    status: job.status,
    application_date: job.applicationDate,
    notes: job.notes,
  };
}