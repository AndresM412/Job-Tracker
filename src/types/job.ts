export type JobStatus =
  | 'Applied'
  | 'Interview'
  | 'Rejected'
  | 'Offer';

export type JobApplication = {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  applicationDate: string;
};