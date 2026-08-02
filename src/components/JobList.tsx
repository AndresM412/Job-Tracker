import JobItem from "./JobItem";
import { type JobApplication } from "../types/job";

type JobListProps = {
  jobs: JobApplication[];
  onDeleteJob: (id:string) => void;
  onEditJob: (job: JobApplication) => void;
};

function JobList({ jobs , onDeleteJob, onEditJob }: JobListProps) {
  return (
    <div>
      {jobs.map((job) => (
        <JobItem key={job.id} job={job} onDeleteJob={onDeleteJob} onEditJob={onEditJob} />
      ))}
    </div>
  );
}

export default JobList;