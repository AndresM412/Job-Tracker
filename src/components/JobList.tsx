import { useState } from "react";
import JobItem from "./JobItem";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { type JobApplication } from "../types/job";

type JobListProps = {
  jobs: JobApplication[];
  onDeleteJob: (id: string) => void;
  onEditJob: (job: JobApplication) => void;
};

function JobList({ jobs, onDeleteJob, onEditJob }: JobListProps) {
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant text-sm font-medium">
        No applications match this filter.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {jobs.map((job) => (
          <JobItem
            key={job.id}
            job={job}
            onRequestDelete={setJobToDelete}
            onEditJob={onEditJob}
          />
        ))}
      </div>

      {jobToDelete && (
        <ConfirmDeleteModal
          job={jobToDelete}
          onConfirm={() => {
            onDeleteJob(jobToDelete.id);
            setJobToDelete(null);
          }}
          onCancel={() => setJobToDelete(null)}
        />
      )}
    </>
  );
}

export default JobList;

