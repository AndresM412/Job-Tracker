export type JobStatus =
  | 'Applied'
  | 'Interview'
  | 'Rejected'
  | 'Offer';

export type WorkMode =
  | 'Remote'
  | 'On-site'
  | 'Hybrid';

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
  jobUrl?: string;
  priority?: number;
  location?: string;
  workMode?: WorkMode;
  officeAddress?: string;
  officeLat?: number;
  officeLng?: number;
  createdAt?: string;
};
