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

const statusGlowClass: Record<string, string> = {
  Applied: "card-glow-applied",
  Interview: "card-glow-interview",
  Offer: "card-glow-offer",
  Rejected: "card-glow-rejected",
};

type JobItemProps = {
  job: JobApplication;
  onRequestDelete: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
};

function JobItem({ job, onRequestDelete, onEditJob }: JobItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="cursor-pointer h-full">
        <Card
          accentColor={statusColor[job.status]}
          glowClass={statusGlowClass[job.status]}
          data-testid={`job-card-${job.company}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-lg text-text wrap-break-word">
                {job.company}
              </h2>
              <p className="text-muted text-sm truncate">{job.position}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-muted/80 mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 opacity-60 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{job.applicationDate}</span>
          </div>

          {job.notes && (
            <div className="bg-bg/60 border border-border/40 rounded-lg p-2.5 my-2 text-xs text-muted/90 leading-relaxed line-clamp-2">
              {job.notes}
            </div>
          )}

          <div className="flex gap-2 mt-auto pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditJob(job);
              }}
              className="btn-edit"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(job);
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
