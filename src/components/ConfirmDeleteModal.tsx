import { useEffect } from "react";
import { type JobApplication } from "../types/job";

type ConfirmDeleteModalProps = {
  job: JobApplication;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDeleteModal({
  job,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  // Cierre accesible al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      data-testid="confirm-delete-modal-backdrop"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        data-testid="confirm-delete-modal"
        className="bg-surface border border-border rounded-xl p-6 max-w-md w-full shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 rounded-lg bg-rejected/15 text-rejected border border-rejected/30 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h2
              id="confirm-delete-title"
              className="font-display font-medium text-lg text-text"
            >
              ¿Eliminar postulación?
            </h2>
            <p
              id="confirm-delete-description"
              className="text-muted text-sm mt-1"
            >
              ¿Estás seguro de que deseas eliminar la postulación para{" "}
              <span className="text-text font-medium">{job.company}</span> (
              <span className="text-text/80">{job.position}</span>)? Esta acción
              no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-border">
          <button
            type="button"
            data-testid="cancel-delete-btn"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted hover:text-text hover:bg-border/40 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-testid="confirm-delete-btn"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-rejected text-bg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-rejected/20 cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
