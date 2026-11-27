import React, { useState, useEffect } from "react";
import { type JobStatus, type JobTimelineEvent } from "../../types/job";
import CharacterCounter from "../ui/CharacterCounter";
import { formatDisplayDate } from "../../utils/dateUtils";

interface TimelineEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: JobTimelineEvent | null;
  initialMode?: "view" | "edit";
  defaultStage?: JobStatus;
  defaultDate?: string;
  onSave: (data: { stage: JobStatus; date: string; notes?: string }) => Promise<void>;
  onDelete?: (event: JobTimelineEvent) => void;
}

const MAX_TIMELINE_NOTES_LENGTH = 500;

const STAGES: Array<{ value: JobStatus; label: string; icon: string }> = [
  { value: "Applied", label: "Applied", icon: "send" },
  { value: "Interview", label: "Interview", icon: "business_center" },
  { value: "Offer", label: "Offer", icon: "payments" },
  { value: "Rejected", label: "Rejected", icon: "cancel" },
];

export const TimelineEventModal: React.FC<TimelineEventModalProps> = ({
  isOpen,
  onClose,
  event,
  initialMode = "edit",
  defaultStage = "Applied",
  defaultDate,
  onSave,
  onDelete,
}) => {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [openedFromViewMode, setOpenedFromViewMode] = useState(false);
  const [stage, setStage] = useState<JobStatus>(defaultStage);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const targetMode = event ? initialMode : "edit";
      setMode(targetMode);
      setOpenedFromViewMode(targetMode === "view");
      if (event) {
        setStage(event.stage);
        setDate(event.date);
        setNotes(event.notes || "");
      } else {
        setStage(defaultStage);
        setDate(defaultDate || new Date().toISOString().split("T")[0]);
        setNotes("");
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, event, initialMode, defaultStage, defaultDate]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCancelEdit = () => {
    if (openedFromViewMode && event) {
      setStage(event.stage);
      setDate(event.date);
      setNotes(event.notes || "");
      setError(null);
      setMode("view");
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date for the milestone.");
      return;
    }
    if (notes.length > MAX_TIMELINE_NOTES_LENGTH) {
      setError(`Notes must be ${MAX_TIMELINE_NOTES_LENGTH} characters or less.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        stage,
        date,
        notes: notes.trim() || undefined,
      });
      if (openedFromViewMode && event) {
        setMode("view");
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save milestone. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageInfo = STAGES.find((s) => s.value === stage) || STAGES[0];

  return (
    <div
      data-testid="timeline-event-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 shadow-2xl shadow-black/60 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-modal-title"
        data-testid="timeline-event-modal"
      >
        {/* Header Estandarizado */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/20 mb-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                mode === "edit"
                  ? "bg-primary-container/20 text-primary-container border-primary-container/30"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/40"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {mode === "view" ? stageInfo.icon : "timeline"}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-semibold block">
                  Timeline Milestone
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                    mode === "edit"
                      ? "bg-primary-container/20 text-primary-container border border-primary-container/30"
                      : "bg-surface-container text-outline border border-outline-variant/30"
                  }`}
                >
                  {mode === "edit" ? "Editing" : "Details"}
                </span>
              </div>
              <h2
                id="timeline-modal-title"
                className="text-base font-bold text-on-surface tracking-tight truncate"
              >
                {mode === "view"
                  ? stageInfo.label
                  : event
                  ? "Edit Milestone"
                  : "Add Milestone"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Body */}
        {mode === "view" ? (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu pr-1 space-y-4">
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 text-xs">
                <span className="text-outline font-medium">Milestone Date</span>
                <span className="font-mono font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-primary" aria-hidden="true">
                    calendar_today
                  </span>
                  <span>{formatDisplayDate(event?.date || date)}</span>
                </span>
              </div>

              <div className="text-xs sm:text-sm text-on-surface-variant whitespace-pre-wrap break-words leading-relaxed bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/20">
                {event?.notes || notes ? (
                  event?.notes || notes
                ) : (
                  <span className="italic text-outline">No detailed notes recorded for this milestone.</span>
                )}
              </div>
            </div>

            {/* View Mode Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/20 mt-4 shrink-0">
              <div>
                {onDelete && event && (
                  <button
                    type="button"
                    data-testid="timeline-event-delete-btn"
                    onClick={() => {
                      onClose();
                      onDelete(event);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:border-error/50 hover:bg-error-container/20 hover:text-error text-on-surface-variant text-xs font-semibold active:scale-95 transition-all duration-150"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      delete
                    </span>
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                data-testid="modal-edit-timeline-btn"
                onClick={() => setMode("edit")}
                className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  edit
                </span>
                <span>Edit</span>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between min-h-0">
            <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu space-y-4 pr-1">
              {error && (
                <div
                  data-testid="timeline-modal-error"
                  className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs"
                >
                  {error}
                </div>
              )}

              {/* Stage Selector */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                  Stage / Milestone
                </label>
                <div className="grid grid-cols-2 gap-2" data-testid="timeline-stage-selector">
                  {STAGES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      data-testid={`timeline-stage-option-${s.value.toLowerCase()}`}
                      onClick={() => setStage(s.value)}
                      className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        stage === s.value
                          ? "bg-primary-container/20 text-primary-container border-primary-container/60 shadow-[0_0_10px_rgba(129,140,248,0.25)]"
                          : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                        {s.icon}
                      </span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label
                  htmlFor="timeline-event-date-input"
                  className="block text-xs font-semibold text-on-surface-variant mb-1.5"
                >
                  Milestone Date
                </label>
                <input
                  id="timeline-event-date-input"
                  data-testid="timeline-event-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-surface-container-lowest text-on-surface text-xs p-3 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all"
                />
              </div>

              {/* Notes Input con límite de 500 caracteres */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="timeline-event-notes-input"
                    className="block text-xs font-semibold text-on-surface-variant"
                  >
                    Notes or Round Details (Optional)
                  </label>
                  <CharacterCounter
                    current={notes.length}
                    max={MAX_TIMELINE_NOTES_LENGTH}
                    testId="timeline-notes-char-count"
                  />
                </div>
                <textarea
                  id="timeline-event-notes-input"
                  data-testid="timeline-event-notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={MAX_TIMELINE_NOTES_LENGTH}
                  rows={4}
                  placeholder="e.g. Recruiter phone screen, Technical loop, or compensation negotiation..."
                  className="w-full bg-surface-container-lowest text-on-surface text-xs p-3 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline/70 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Edit Mode Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/20 mt-4 shrink-0">
              <div>
                {event && onDelete && (
                  <button
                    type="button"
                    data-testid="timeline-event-delete-btn"
                    onClick={() => {
                      onClose();
                      onDelete(event);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-error/30 bg-error-container/10 text-error hover:bg-error-container/20 text-xs font-semibold transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      delete
                    </span>
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="timeline-event-cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="cursor-pointer px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface text-xs font-semibold active:scale-95 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="timeline-event-submit-btn"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    check
                  </span>
                  <span>{isSubmitting ? "Saving..." : event ? "Save Changes" : "Add Milestone"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TimelineEventModal;
