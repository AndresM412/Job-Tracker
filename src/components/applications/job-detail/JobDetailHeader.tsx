import React from "react";
import { type JobApplication } from "../../../types/job";
import StatusBadge from "../../ui/StatusBadge";
import StarRating from "../../ui/StarRating";

interface JobDetailHeaderProps {
  job: JobApplication;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  activeTab: "overview" | "notes";
  onTabChange: (tab: "overview" | "notes") => void;
  notesCount: number;
}

export const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  onBack,
  onEdit,
  onDelete,
  activeTab,
  onTabChange,
  notesCount,
}) => {
  return (
    <div className="space-y-2 sm:space-y-2.5 shrink-0">
      {/* Botón Volver a la Lista de Aplicaciones */}
      <div className="flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onBack}
          data-testid="back-to-applications-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface px-2.5 py-1 rounded-lg hover:bg-surface-container border border-outline-variant/30 transition-all cursor-pointer group"
        >
          <span
            className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform"
            aria-hidden="true"
          >
            arrow_back
          </span>
          <span>Back to Applications</span>
        </button>
      </div>

      {/* Elevated Hero Record Card with Ambient Glow */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low border border-outline-variant/40 p-4 sm:p-5 lg:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.36)] shrink-0">
        {/* Ambient Backdrop Glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full bg-secondary/5 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Identity Group */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {/* Company Emblem */}
            <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-container-high border border-primary/30 flex items-center justify-center font-bold text-xl sm:text-2xl text-primary shadow-[0_0_24px_rgba(129,140,248,0.22)]">
              <span>{job.company.charAt(0).toUpperCase()}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight truncate max-w-full">
                  {job.company}
                </h1>
                <StatusBadge status={job.status} />
                <div className="inline-flex items-center gap-1 pl-1 border-l border-outline-variant/30">
                  <StarRating
                    value={job.priority}
                    size="sm"
                    testIdPrefix="detail-priority-star"
                  />
                </div>
              </div>

              <div className="text-xs sm:text-sm font-medium text-on-surface-variant truncate max-w-full">
                {job.position}
              </div>
            </div>
          </div>

          {/* Controls / Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              data-testid="detail-edit-job-btn"
              onClick={onEdit}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                edit
              </span>
              <span>Edit</span>
            </button>
            <button
              type="button"
              data-testid="detail-delete-job-btn"
              onClick={onDelete}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:border-error/50 hover:bg-error-container/20 hover:text-error text-on-surface-variant text-xs font-semibold active:scale-95 transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                delete
              </span>
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Navigation Segment Tabs */}
        <div className="relative z-10 flex items-center gap-8 mt-5 pt-3.5 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => onTabChange("overview")}
            className={`relative pb-2 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "overview"
                ? "text-on-surface font-bold"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span>Overview</span>
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange("notes")}
            className={`relative pb-2 text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "notes"
                ? "text-on-surface font-bold"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span>Notes</span>
            {notesCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-surface-container-highest border border-outline-variant/40 text-primary font-mono font-bold">
                {notesCount}
              </span>
            )}
            {activeTab === "notes" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailHeader;

