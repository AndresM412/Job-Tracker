export type JobStatus =
  | 'Applied'
  | 'Interview'
  | 'Rejected'
  | 'Offer';

export interface JobNote {
  id: string;
  jobId: string;
  title: string;
  content: string;
  createdAt: string;
}

export type JobApplication = {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  applicationDate: string;
  notes?: JobNote[];
  salary?: string;
  round?: string;
  description?: string;
  createdAt?: string;
};
