import React, { useState, useEffect } from "react";
import { type JobNote } from "../../types/job";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: JobNote | null;
  initialMode?: "view" | "edit";
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  onDelete?: (note: JobNote) => void;
}

function renderFormattedNotes(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-container underline hover:brightness-125 break-all font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function formatNoteDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const datePart = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} • ${timePart}`;
  } catch {
    return dateStr;
  }
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  note,
  initialMode = "view",
  onSubmit,
  onDelete,
}) => {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openedFromViewMode, setOpenedFromViewMode] = useState(false);

  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 4000;

  useEffect(() => {
    if (isOpen) {
      const targetMode = note ? initialMode : "edit";
      setMode(targetMode);
      setOpenedFromViewMode(targetMode === "view");
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      } else {
        setTitle("");
        setContent("");
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, note, initialMode]);

  useEffect(() => {
    if (!isOpen) return;

    // Congelar scroll del documento de fondo para eliminar scroll-chaining y lag
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title for the note.");
      return;
    }
    if (!content.trim()) {
      setError("Please provide the note content.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
      });
      if (openedFromViewMode && note) {
        setMode("view");
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setError(null);
      setMode("view");
    } else {
      onClose();
    }
  };

  return (
    <div
      data-testid={mode === "view" ? "note-detail-modal-backdrop" : "note-modal-backdrop"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 shadow-2xl shadow-black/60 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={mode === "view" ? "note-detail-modal-title" : "note-modal-title"}
        data-testid={mode === "view" ? "note-detail-modal" : "note-modal"}
      >
        {/* Header Estandarizado (idéntica estructura y dimensiones a JobDescriptionModal) */}
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
                {mode === "edit" ? (note ? "edit_note" : "note_add") : "sticky_note_2"}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-semibold block">
                  Note
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
                id={mode === "view" ? "note-detail-modal-title" : "note-modal-title"}
                className="text-base font-bold text-on-surface tracking-tight truncate"
              >
                {mode === "view"
                  ? note?.title || title
                  : note
                  ? "Edit Note"
                  : "Add Modular Note"}
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

        {/* Modal Body (Acelerado por capa GPU y con overscroll aislado) */}
        {mode === "view" ? (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu pr-1 space-y-4">
              <div className="text-xs sm:text-sm text-on-surface-variant whitespace-pre-wrap break-words leading-relaxed bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/20">
                {renderFormattedNotes(note?.content || content)}
              </div>

              {note?.createdAt && (
                <div className="text-[10px] text-outline text-right pt-1">
                  Recorded on {formatNoteDate(note.createdAt)}
                </div>
              )}
            </div>

            {/* View Mode Footer Estandarizado */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/20 mt-4 shrink-0">
              <div>
                {onDelete && note && (
                  <button
                    type="button"
                    data-testid="modal-delete-note-btn"
                    onClick={() => {
                      onClose();
                      onDelete(note);
                    }}
                    className="h-9 px-4 rounded-lg bg-error-container/20 hover:bg-error-container/30 text-error border border-error/30 text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                      delete
                    </span>
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                  Close
                </button>

                <button
                  type="button"
                  data-testid="modal-edit-note-btn"
                  onClick={() => {
                    setTitle(note?.title || title);
                    setContent(note?.content || content);
                    setMode("edit");
                  }}
                  className="h-9 px-4 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                    edit
                  </span>
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between min-h-0">
            {/* Edit Mode Inputs (Acelerado por capa GPU y con overscroll aislado) */}
            <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu space-y-3.5 pr-1">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Title Field */}
              <div>
                <label
                  htmlFor="note-title-input"
                  className="block text-xs font-medium text-on-surface mb-1"
                >
                  Note Title <span className="text-error">*</span>
                </label>
                <input
                  id="note-title-input"
                  data-testid="note-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., HR Screen takeaways, System Design Loop..."
                  maxLength={MAX_TITLE_LENGTH}
                  className="w-full bg-surface-container-lowest text-on-surface text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline/70"
                  autoFocus
                />
                <div className="flex justify-end mt-1 text-[10px] text-outline">
                  <span>
                    {title.length} / {MAX_TITLE_LENGTH}
                  </span>
                </div>
              </div>

              {/* Content Field */}
              <div>
                <label
                  htmlFor="note-content-input"
                  className="block text-xs font-medium text-on-surface mb-1"
                >
                  Note Content <span className="text-error">*</span>
                </label>
                <textarea
                  id="note-content-input"
                  data-testid="note-content-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Record interview feedback, recruiter contact info, offer breakdowns, or key follow-up action items..."
                  rows={6}
                  maxLength={MAX_CONTENT_LENGTH}
                  className="w-full bg-surface-container-lowest text-on-surface text-xs sm:text-sm p-3.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline/70 resize-none leading-relaxed"
                />
                <div className="flex justify-end mt-1 text-[10px] text-outline">
                  <span>
                    {content.length} / {MAX_CONTENT_LENGTH}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Mode Footer Estandarizado (mismos tamaños h-9 y estilos idénticos a JobDescriptionModal) */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20 mt-4 shrink-0">
              <button
                type="button"
                data-testid="note-cancel-btn"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="h-9 px-4 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="note-submit-btn"
                disabled={isSubmitting}
                className="h-9 px-4 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                  check
                </span>
                <span>{isSubmitting ? "Saving..." : note ? "Save Changes" : "Create Note"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NoteModal;
