import { type JobApplication, type JobNote } from "../types/job";

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
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  const data = await response.json();
  return data.map(mapFromApi);
}

export async function createJob(
  job: (Omit<JobApplication, "id"> | JobApplication) & { initialNote?: string }
): Promise<JobApplication> {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(mapToApi(job)),
  });
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
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
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
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
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (!response.ok) {
    throw new Error("Failed to delete job");
  }
}

// --- NOTES API ---

export async function addJobNote(
  jobId: string,
  payload: { title: string; content: string }
): Promise<JobNote> {
  const response = await fetch(`${API_URL}/jobs/${jobId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (!response.ok) {
    throw new Error("Failed to add note");
  }
  const data = await response.json();
  return mapNoteFromApi(data);
}

export async function updateJobNote(
  jobId: string,
  noteId: string,
  payload: { title?: string; content?: string }
): Promise<JobNote> {
  const response = await fetch(`${API_URL}/jobs/${jobId}/notes/${noteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (!response.ok) {
    throw new Error("Failed to update note");
  }
  const data = await response.json();
  return mapNoteFromApi(data);
}

export async function deleteJobNote(
  jobId: string,
  noteId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/jobs/${jobId}/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (!response.ok) {
    throw new Error("Failed to delete note");
  }
}

// --- MAPPERS ---

function mapNoteFromApi(apiNote: any): JobNote {
  return {
    id: apiNote.id,
    jobId: apiNote.job_id,
    title: apiNote.title,
    content: apiNote.content,
    createdAt: apiNote.created_at,
  };
}

// El backend usa snake_case (application_date), el frontend usa camelCase (applicationDate)
function mapFromApi(apiJob: any): JobApplication {
  return {
    id: apiJob.id,
    company: apiJob.company,
    position: apiJob.position,
    status: apiJob.status,
    applicationDate: apiJob.application_date,
    notes: Array.isArray(apiJob.notes) ? apiJob.notes.map(mapNoteFromApi) : [],
    salary: apiJob.salary ?? undefined,
    round: apiJob.round ?? undefined,
    description: apiJob.description ?? undefined,
    createdAt: apiJob.created_at ?? undefined,
  };
}

function mapToApi(
  job: (Omit<JobApplication, "id"> | JobApplication) & {
    initialNote?: string;
    notes?: any;
  }
) {
  const notePayload =
    typeof job.initialNote === "string"
      ? job.initialNote
      : typeof job.notes === "string"
      ? job.notes
      : undefined;

  return {
    company: job.company,
    position: job.position,
    status: job.status,
    application_date: job.applicationDate,
    notes: notePayload,
    salary: job.salary,
    round: job.round,
    description: job.description,
  };
}
