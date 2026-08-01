import JobItem from "./JobItem";
import { type JobApplication } from "../types/job";

type JobListProps = {
  jobs: JobApplication[];
  onDeleteJob: (id:string) => void;
};

function JobList({ jobs , onDeleteJob }: JobListProps) {
  return (
    <div>
      {jobs.map((job) => (
        <JobItem key={job.id} job={job} onDeleteJob={onDeleteJob} />
      ))}
    </div>
  );
}

export default JobList;