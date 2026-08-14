import JobItem from "./JobItem";
import { type JobApplication } from "../types/job";

type JobListProps = {
  jobs: JobApplication[];
  onDeleteJob: (id: string) => void;
  onEditJob: (job: JobApplication) => void;
};

function JobList({ jobs, onDeleteJob, onEditJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 text-muted text-sm">
        No applications match this filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
      {jobs.map((job) => (
        <JobItem
          key={job.id}
          job={job}
          onDeleteJob={onDeleteJob}
          onEditJob={onEditJob}
        />
      ))}
    </div>
  );
}

export default JobList;
