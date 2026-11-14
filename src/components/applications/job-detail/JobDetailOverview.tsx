import React from "react";
import { type JobApplication } from "../../../types/job";
import WorkModeBadge from "../../ui/WorkModeBadge";
import { getSafeHttpUrl } from "../../../utils/urlUtils";

interface JobDetailOverviewProps {
  job: JobApplication;
  onOpenMap: () => void;
}

export const JobDetailOverview: React.FC<JobDetailOverviewProps> = ({
  job,
  onOpenMap,
}) => {
  const safeJobUrl = getSafeHttpUrl(job.jobUrl);

  return (
    <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/40 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20 mb-3.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span
              className="material-symbols-outlined text-[17px]"
              aria-hidden="true"
            >
              dataset
            </span>
          </div>
          <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface">
            Application Overview
          </h2>
        </div>

        {/* Cuadrícula métrica de 6 campos (iconos a 14px como en el mockup) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6 sm:mb-8">
          {/* 1. Date Applied */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-medium">
                Date Applied
              </span>
              <div className="w-6 h-6 rounded-md bg-primary-container/15 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >
                  calendar_today
                </span>
              </div>
            </div>
            <div className="text-xs sm:text-[13px] font-semibold text-on-surface font-mono tracking-tight truncate">
              {job.applicationDate}
            </div>
          </div>

          {/* 2. Stage / Round */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-medium">
                Stage / Round
              </span>
              <div className="w-6 h-6 rounded-md bg-tertiary/15 flex items-center justify-center text-tertiary">
                <span
                  className="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >
                  flag
                </span>
              </div>
            </div>
            <div
              className="text-xs sm:text-[13px] font-semibold text-on-surface truncate font-mono"
              title={job.round}
            >
              {job.round || "Not specified"}
            </div>
          </div>

          {/* 3. Compensation */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-medium">
                Compensation
              </span>
              <div className="w-6 h-6 rounded-md bg-secondary/15 flex items-center justify-center text-secondary">
                <span
                  className="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >
                  payments
                </span>
              </div>
            </div>
            <div
              className="text-xs sm:text-[13px] font-semibold text-secondary font-mono tracking-tight truncate"
              title={job.salary}
            >
              {job.salary || "Not specified"}
            </div>
          </div>

          {/* 4. Work Type */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-medium">
                Work Type
              </span>
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >
                  business_center
                </span>
              </div>
            </div>
            <div className="truncate">
              {job.workMode ? (
                <WorkModeBadge mode={job.workMode} size="sm" />
              ) : (
                <span className="text-xs sm:text-[13px] font-medium text-on-surface-variant/70">
                  Not specified
                </span>
              )}
            </div>
          </div>

          {/* 5. Location */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-medium">
                Location
              </span>
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >
                  location_on
                </span>
              </div>
            </div>
            <div
              data-testid="detail-location-text"
              className="text-xs sm:text-[13px] font-semibold text-on-surface truncate"
              title={job.location}
            >
              {job.location || "Not specified"}
            </div>
          </div>

          {/* 6. Job Link */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-medium">
                Job Link
              </span>
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >
                  link
                </span>
              </div>
            </div>
            {safeJobUrl ? (
              <a
                href={safeJobUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="detail-job-url-link"
                title={safeJobUrl}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-fixed underline-offset-4 hover:underline text-xs sm:text-[13px] truncate transition-colors"
              >
                <span className="truncate">
                  {new URL(safeJobUrl).hostname.replace(/^www\./, "")}
                </span>
                <span
                  className="material-symbols-outlined text-[14px] shrink-0"
                  aria-hidden="true"
                >
                  open_in_new
                </span>
              </a>
            ) : (
              <span className="font-medium text-on-surface-variant/70 text-xs sm:text-[13px] block">
                Not provided
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 7. Inset Office Location Sub-card (20px y 16px como en el mockup) */}
      <div className="mt-auto p-3.5 sm:p-4 rounded-md bg-surface-container-lowest border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <span
              className="material-symbols-outlined text-[20px]"
              aria-hidden="true"
            >
              explore
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-semibold leading-none">
              Office Location
            </span>
            <span
              className="text-xs sm:text-[13px] font-semibold text-on-surface truncate mt-1"
              title={job.officeAddress || undefined}
            >
              {job.officeAddress ||
                (job.location
                  ? `Office location in ${job.location}`
                  : "No office address pinned yet")}
            </span>
          </div>
        </div>

        <button
          type="button"
          data-testid="open-office-map-btn"
          onClick={onOpenMap}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
        >
          <span
            className="material-symbols-outlined text-[16px] text-secondary"
            aria-hidden="true"
          >
            {job.officeAddress ? "map" : "pin_drop"}
          </span>
          <span>{job.officeAddress ? "View on Map" : "Pin Office"}</span>
        </button>
      </div>
    </div>
  );
};

export default JobDetailOverview;
