import { type JobApplication } from "../types/job";
import Card from "./Card";
import StatusBadge from "./StatusBadge";
import { useState } from "react";
import JobModal from "./JobModal";

const spineClassMap: Record<string, string> = {
  Applied: "bg-tertiary",
  Interview: "bg-primary-container",
  Offer: "bg-secondary",
  Rejected: "bg-error",
};

const statusGlowClass: Record<string, string> = {
  Applied: "hover:shadow-[0_0_24px_rgba(255,185,95,0.12)]",
  Interview: "hover:shadow-[0_0_24px_rgba(129,140,248,0.12)]",
  Offer: "hover:shadow-[0_0_24px_rgba(78,222,163,0.12)]",
  Rejected: "hover:shadow-[0_0_24px_rgba(255,180,171,0.12)]",
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
          spineClass={spineClassMap[job.status] || "bg-primary-container"}
          glowClass={statusGlowClass[job.status]}
          data-testid={`job-card-${job.company}`}
        >
          <div>
            {/* Title & Status Row */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="min-w-0">
                <h2 className="text-[1.125rem] font-bold text-on-surface tracking-tight leading-snug truncate">
                  {job.company}
                </h2>
                <p className="text-[0.875rem] text-on-surface-variant font-normal leading-normal mt-0.5 truncate">
                  {job.position}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {/* Date & Salary Row */}
            <div className="flex items-center gap-2 mb-3 text-on-surface-variant/80 text-xs min-w-0">
              <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <svg
                  className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{job.applicationDate}</span>
              </div>
              {job.salary && (
                <>
                  <span className="shrink-0 text-outline-variant/60">•</span>
                  <span
                    title={job.salary}
                    className="px-2 py-0.5 rounded bg-surface-container-highest font-semibold text-[11px] leading-tight text-on-surface truncate whitespace-nowrap min-w-0 max-w-[170px]"
                  >
                    {job.salary}
                  </span>
                </>
              )}
            </div>

            {/* Notes Preview Block */}
            <div className="bg-surface-container-lowest/60 rounded-lg p-2.5 mb-4 text-xs text-on-surface-variant font-normal leading-relaxed min-h-[58px] flex items-center overflow-hidden">
              <p className="line-clamp-2 break-words text-xs">
                {job.notes || "No additional notes provided for this application."}
              </p>
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between pt-2 gap-2 min-w-0">
            <span
              title={job.round || undefined}
              className={`text-[11px] font-semibold uppercase tracking-wider truncate min-w-0 mr-2 ${
                job.round
                  ? "text-outline"
                  : job.status === "Offer"
                  ? "text-secondary"
                  : job.status === "Rejected"
                  ? "text-error/80"
                  : "text-outline"
              }`}
            >
              {job.round ||
                (job.status === "Offer"
                  ? "Decision Pending"
                  : job.status === "Rejected"
                  ? "Archived"
                  : job.status === "Interview"
                  ? "In Progress"
                  : "Awaiting Review")}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditJob(job);
                }}
                className="px-3 py-1 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-medium transition-all cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete(job);
                }}
                className="px-3 py-1 rounded bg-error-container/30 hover:bg-error-container text-error text-xs font-medium transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
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


