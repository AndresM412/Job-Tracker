import { type JobApplication } from "../types/job";
import Card from "./Card";
import StatusBadge from "./StatusBadge";
import { useState } from "react";
import JobModal from "./JobModal";

const statusColor: Record<string, string> = {
  Applied: "var(--color-applied)",
  Interview: "var(--color-interview)",
  Offer: "var(--color-offer)",
  Rejected: "var(--color-rejected)",
};

type JobItemProps = {
  job: JobApplication;
  onDeleteJob: (id: string) => void;
  onEditJob: (job: JobApplication) => void;
};

function JobItem({ job, onDeleteJob, onEditJob }: JobItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer h-full">
        <Card
          accentColor={statusColor[job.status]}
          data-testid={`job-card-${job.company}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display font-medium text-lg text-text wrap-break-word">
                {job.company}
              </h2>
              <p className="text-muted text-sm truncate">{job.position}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <p className="font-mono text-xs text-muted mt-2">
            {job.applicationDate}
          </p>

          <div className="flex gap-2 mt-auto pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation;
                onEditJob(job);
              }}
              className="btn-edit"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteJob(job.id);
              }}
              className="btn-delete"
            >
              Delete
            </button>
          </div>
        </Card>
      </div>
      {isModalOpen && (
        <JobModal job={job} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

export default JobItem;
