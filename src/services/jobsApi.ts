import { type JobApplication, type JobNote, type WorkMode } from "../types/job";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type JobPatchPayload = {
  priority?: number;
  description?: string | null;
  jobUrl?: string | null;
  location?: string | null;
  workMode?: WorkMode | null;
  officeAddress?: string | null;
  officeLat?: number | null;
  officeLng?: number | null;
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("job_tracker_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
      return body.detail[0].msg;
    }
  } catch {
    // Fallback if response has no JSON body
  }
  return fallback;
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
    throw new Error(await parseErrorMessage(response, "Failed to create job"));
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
    throw new Error(await parseErrorMessage(response, "Failed to update job"));
  }
  const data = await response.json();
  return mapFromApi(data);
}

export async function patchJob(id: string, patch: JobPatchPayload): Promise<JobApplication> {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(mapPatchToApi(patch)),
  });
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to update job fields"));
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
    jobUrl: apiJob.job_url ?? undefined,
    priority: typeof apiJob.priority === "number" ? apiJob.priority : 0,
    location: apiJob.location ?? undefined,
    workMode: apiJob.work_mode ?? undefined,
    officeAddress: apiJob.office_address ?? undefined,
    officeLat: typeof apiJob.office_lat === "number" ? apiJob.office_lat : undefined,
    officeLng: typeof apiJob.office_lng === "number" ? apiJob.office_lng : undefined,
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
    // Enviar null explícito permite limpiar campos editables del formulario con exclude_unset=True
    salary: job.salary ?? null,
    round: job.round ?? null,
    job_url: job.jobUrl ?? null,
    location: job.location ?? null,
    work_mode: job.workMode ?? null,
    ...(job.description !== undefined ? { description: job.description } : {}),
    ...(job.priority !== undefined ? { priority: job.priority } : {}),
    ...(job.officeAddress !== undefined ? { office_address: job.officeAddress } : {}),
    ...(job.officeLat !== undefined ? { office_lat: job.officeLat } : {}),
    ...(job.officeLng !== undefined ? { office_lng: job.officeLng } : {}),
  };
}

const PATCH_FIELD_KEY_MAP: Record<keyof JobPatchPayload, string> = {
  priority: "priority",
  description: "description",
  jobUrl: "job_url",
  location: "location",
  workMode: "work_mode",
  officeAddress: "office_address",
  officeLat: "office_lat",
  officeLng: "office_lng",
};

function mapPatchToApi(patch: JobPatchPayload): Record<string, unknown> {
  const apiPayload: Record<string, unknown> = {};
  (Object.keys(PATCH_FIELD_KEY_MAP) as Array<keyof JobPatchPayload>).forEach((key) => {
    if (key in patch && patch[key] !== undefined) {
      apiPayload[PATCH_FIELD_KEY_MAP[key]] = patch[key];
    }
  });
  return apiPayload;
}
