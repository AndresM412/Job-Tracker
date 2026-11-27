import React from "react";
import { type JobStatus, type JobTimelineEvent } from "../../../types/job";
import { formatDisplayDate } from "../../../utils/dateUtils";

const MAX_TIMELINE_EVENTS = 10;

interface JobTimelineSectionProps {
  timeline: JobTimelineEvent[];
  currentStatus: JobStatus;
  onAddMilestone: () => void;
  onViewMilestone: (event: JobTimelineEvent) => void;
  onEditMilestone: (event: JobTimelineEvent) => void;
  onDeleteMilestone: (event: JobTimelineEvent) => void;
}

function isMilestoneNoteLong(notes?: string): boolean {
  if (!notes) return false;
  return notes.length > 90 || (notes.match(/\n/g) || []).length >= 2;
}

function getStageConfig(stage: JobStatus) {
  switch (stage) {
    case "Applied":
      return {
        icon: "send",
        label: "Applied",
        defaultNote: "Application submitted",
        nodeColor: "bg-[#ffb95f]/15 text-[#ffb95f] border-[#ffb95f]/40 shadow-[0_0_10px_rgba(255,185,95,0.2)]",
      };
    case "Interview":
      return {
        icon: "business_center",
        label: "Interview",
        defaultNote: "Interview process initiated",
        nodeColor: "bg-[#818cf8]/15 text-[#818cf8] border-[#818cf8]/40 shadow-[0_0_10px_rgba(129,140,248,0.2)]",
      };
    case "Offer":
      return {
        icon: "payments",
        label: "Offer Extended",
        defaultNote: "Offer received, package evaluation",
        nodeColor: "bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/40 shadow-[0_0_10px_rgba(78,222,163,0.2)]",
      };
    case "Rejected":
      return {
        icon: "close",
        label: "Archived / Closed",
        defaultNote: "Application closed or unselected",
        nodeColor: "bg-[#ffb4ab]/15 text-[#ffb4ab] border-[#ffb4ab]/40 shadow-[0_0_10px_rgba(255,180,171,0.2)]",
      };
  }
}

export const JobTimelineSection: React.FC<JobTimelineSectionProps> = ({
  timeline,
  currentStatus,
  onAddMilestone,
  onViewMilestone,
  onEditMilestone,
  onDeleteMilestone,
}) => {
  const isLimitReached = timeline.length >= MAX_TIMELINE_EVENTS;

  return (
    <div
      data-testid="job-timeline-section"
      className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between h-full flex-1"
    >
      <div>
        {/* Cabecera idéntica a Notes y Overview */}
        <div className="flex items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-outline-variant/20 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
                timeline
              </span>
            </div>
            <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface">
              TIMELINE & MILESTONES
            </h2>
            <span
              data-testid="timeline-count-badge"
              className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-surface-container-highest border border-outline-variant/40 text-primary font-mono"
            >
              {timeline.length}
            </span>
            {isLimitReached && (
              <span
                data-testid="timeline-limit-badge"
                className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-tertiary/15 text-tertiary border border-tertiary/30"
              >
                Max {MAX_TIMELINE_EVENTS}
              </span>
            )}
          </div>

          <button
            type="button"
            data-testid="add-timeline-milestone-btn"
            onClick={onAddMilestone}
            disabled={isLimitReached}
            title={
              isLimitReached
                ? `Maximum of ${MAX_TIMELINE_EVENTS} milestones reached`
                : "Add milestone"
            }
            className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-none disabled:active:scale-100"
          >
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
              add
            </span>
            <span>Add Milestone</span>
          </button>
        </div>

        {/* Lista de Hitos Cronológicos */}
        {timeline.length > 0 ? (
          <div className="relative pl-6 sm:pl-7 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/25">
            {timeline.map((event) => {
              const config = getStageConfig(event.stage);
              const isCurrent = event.stage === currentStatus;
              const isLong = isMilestoneNoteLong(event.notes);

              return (
                <div
                  key={event.id}
                  data-testid={`timeline-event-item-${event.id}`}
                  className="relative group/timeline"
                >
                  {/* Nodo circular en la línea */}
                  <div
                    className={`absolute -left-6 sm:-left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border text-[13px] z-10 transition-transform duration-200 group-hover/timeline:scale-110 ${config.nodeColor}`}
                  >
                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                      {config.icon}
                    </span>
                  </div>

                  {/* Tarjeta con la misma anatomía que JobNotesSection: Cabecera -> Cuerpo -> Pie */}
                  <div className="bg-surface-container-lowest/60 hover:bg-surface-container/60 border border-outline-variant/20 hover:border-outline-variant/40 rounded-xl p-3.5 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-on-surface">
                            {config.label}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                              Current Stage
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover/timeline:opacity-100 transition-opacity">
                          <button
                            type="button"
                            data-testid={`edit-timeline-btn-${event.id}`}
                            onClick={() => onEditMilestone(event)}
                            className="p-1 rounded text-[#c6c5d5] hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Edit milestone date and notes"
                            aria-label={`Edit milestone ${config.label}`}
                          >
                            <span className="material-symbols-outlined text-[16px] leading-none select-none" aria-hidden="true">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            data-testid={`delete-timeline-btn-${event.id}`}
                            onClick={() => onDeleteMilestone(event)}
                            className="p-1 rounded text-[#c6c5d5] hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Delete milestone"
                            aria-label={`Delete milestone ${config.label}`}
                          >
                            <span className="material-symbols-outlined text-[16px] leading-none select-none" aria-hidden="true">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>

                      <p
                        data-testid={`timeline-event-notes-${event.id}`}
                        className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 break-words"
                      >
                        {event.notes || config.defaultNote}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-outline-variant/15 flex items-center justify-between text-outline text-[11px]">
                      <span
                        data-testid={`timeline-event-date-${event.id}`}
                        className="font-mono flex items-center gap-1.5 text-outline"
                      >
                        <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                          calendar_today
                        </span>
                        <span>{formatDisplayDate(event.date)}</span>
                      </span>

                      {isLong && (
                        <button
                          type="button"
                          data-testid={`read-more-timeline-btn-${event.id}`}
                          onClick={() => onViewMilestone(event)}
                          style={{
                            color: "rgb(189 194 255 / var(--tw-text-opacity, 1))",
                          }}
                          className="font-label-sm text-label-sm font-semibold hover:brightness-125 transition-all flex items-center gap-1 cursor-pointer group/more"
                        >
                          <span>Read more</span>
                          <span
                            className="material-symbols-outlined text-[13px] group-hover/more:translate-x-0.5 transition-transform duration-150"
                            aria-hidden="true"
                          >
                            arrow_forward
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            data-testid="timeline-empty-state"
            className="bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-outline mb-3 mx-auto">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                timeline
              </span>
            </div>
            <h3 className="font-semibold text-xs text-on-surface mb-1">
              No timeline milestones recorded
            </h3>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto mb-3">
              Track the progress of your application across stages with dates and feedback.
            </p>
            <button
              type="button"
              onClick={onAddMilestone}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                add
              </span>
              <span>Add Initial Milestone</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTimelineSection;
