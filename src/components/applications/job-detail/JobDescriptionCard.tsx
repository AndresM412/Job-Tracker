import React from "react";

interface JobDescriptionCardProps {
  description?: string | null;
  onOpenModal: (mode: "view" | "edit") => void;
}

function isDescriptionLong(desc?: string | null): boolean {
  if (!desc) return false;
  return desc.length > 150 || (desc.match(/\n/g) || []).length >= 3;
}

export const JobDescriptionCard: React.FC<JobDescriptionCardProps> = ({
  description,
  onOpenModal,
}) => {
  return (
    <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/40 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between h-full">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
                description
              </span>
            </div>
            <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface">
              Job Description
            </h2>
          </div>

          {description && (
            <button
              type="button"
              data-testid="edit-description-btn"
              onClick={() => onOpenModal("edit")}
              style={{
                color: "rgb(189 194 255 / var(--tw-text-opacity, 1))",
              }}
              className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold hover:brightness-125 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                edit
              </span>
              <span>Update</span>
            </button>
          )}
        </div>

        {description ? (
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div
              data-testid="job-description-content"
              className={`font-body-md text-body-md text-on-surface-variant break-words leading-relaxed ${
                isDescriptionLong(description)
                  ? "line-clamp-6 sm:line-clamp-7 lg:line-clamp-8"
                  : ""
              }`}
            >
              {description}
            </div>
            {isDescriptionLong(description) && (
              <div className="pt-2 mt-auto shrink-0 flex items-center justify-end">
                <button
                  type="button"
                  data-testid="view-full-description-btn"
                  onClick={() => onOpenModal("view")}
                  style={{
                    color: "rgb(189 194 255 / var(--tw-text-opacity, 1))",
                  }}
                  className="font-label-sm text-label-sm font-semibold hover:brightness-125 transition-all cursor-pointer inline-flex items-center gap-1 group/more"
                >
                  <span>Read more</span>
                  <span
                    className="material-symbols-outlined text-[13px] group-hover/more:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-lowest min-h-[220px]">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mb-4 shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-outline" aria-hidden="true">
                feed
              </span>
            </div>
            <p className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No job description added yet.
            </p>
            <p className="text-[11px] text-on-surface-variant max-w-xs mb-4 leading-relaxed">
              Paste the requirements, responsibilities, or tech stack to keep key qualifications handy.
            </p>
            <button
              type="button"
              data-testid="add-description-btn"
              onClick={() => onOpenModal("edit")}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                add
              </span>
              <span>Add Description</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescriptionCard;

