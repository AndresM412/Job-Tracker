import React, { useState, useEffect } from "react";

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  company: string;
  position: string;
  initialMode?: "view" | "edit";
  onSave: (newDescription: string) => Promise<void>;
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

export const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  isOpen,
  onClose,
  description,
  company,
  position,
  initialMode = "view",
  onSave,
}) => {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [draft, setDraft] = useState(description);
  const [isSaving, setIsSaving] = useState(false);
  const [openedFromViewMode, setOpenedFromViewMode] = useState(
    initialMode === "view" || (Boolean(description) && initialMode !== "edit"),
  );

  const MAX_DESCRIPTION_LENGTH = 3000;

  useEffect(() => {
    if (isOpen) {
      const targetMode = initialMode || (description ? "view" : "edit");
      setMode(targetMode);
      setDraft(description || "");
      setOpenedFromViewMode(targetMode === "view");
      setIsSaving(false);
    }
  }, [isOpen, description, initialMode]);

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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(draft.trim());
      if (openedFromViewMode) {
        setMode("view");
      } else {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (description) {
      setDraft(description);
      setMode("view");
    } else {
      onClose();
    }
  };

  return (
    <div
      data-testid="job-description-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-description-modal-title"
        data-testid="job-description-modal"
        className="w-full max-w-xl bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 shadow-2xl shadow-black/60 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
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
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
                {mode === "edit" ? "edit_document" : "description"}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-semibold block">
                  Job Description
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
                id="job-description-modal-title"
                className="text-base font-bold text-on-surface tracking-tight truncate"
              >
                {mode === "edit"
                  ? description
                    ? "Edit Description"
                    : "Add Description"
                  : `${position} • ${company}`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </div>

        {/* Modal Body (Acelerado por capa GPU y con overscroll aislado) */}
        {mode === "view" ? (
          <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu pr-1 space-y-4">
            <div className="text-xs sm:text-sm text-on-surface-variant whitespace-pre-wrap break-words leading-relaxed bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/20">
              {renderFormattedNotes(description)}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu space-y-2 pr-1">
            <textarea
              data-testid="job-description-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste or write the job description, core responsibilities, or requirements..."
              rows={9}
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="w-full bg-surface-container-lowest text-on-surface text-xs sm:text-sm p-3.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline/70 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-end text-[10px] text-outline">
              <span>
                {draft.length} / {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions Estandarizado (estilos simétricos con hover luminoso) */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20 mt-4 shrink-0">
          {mode === "view" ? (
            <button
              type="button"
              data-testid="modal-edit-description-btn"
              onClick={() => {
                setDraft(description);
                setMode("edit");
              }}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
                edit
              </span>
              <span>Update</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-semibold active:scale-95 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="modal-save-description-btn"
                onClick={handleSave}
                disabled={isSaving || draft.length > MAX_DESCRIPTION_LENGTH}
                className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150 disabled:opacity-50"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  aria-hidden="true"
                >
                  check
                </span>
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionModal;
