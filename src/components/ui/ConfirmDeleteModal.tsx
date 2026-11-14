import { useEffect } from "react";
import { type JobApplication } from "../../types/job";

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
  // Cierre accesible al presionar la tecla Escape y bloqueo de scroll de fondo
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      data-testid="confirm-delete-modal-backdrop"
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        data-testid="confirm-delete-modal"
        className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 rounded-xl bg-error-container/20 text-error border border-error/30 shrink-0">
            <span className="material-symbols-outlined text-[22px]">delete</span>
          </div>
          <div>
            <h2
              id="confirm-delete-title"
              className="font-bold text-lg text-on-surface"
            >
              Delete application?
            </h2>
            <p
              id="confirm-delete-description"
              className="text-on-surface-variant text-sm mt-1"
            >
              Are you sure you want to delete the application for{" "}
              <span className="text-on-surface font-semibold">{job.company}</span> (
              <span className="text-on-surface-variant">{job.position}</span>)? This action
              cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            data-testid="cancel-delete-btn"
            onClick={onCancel}
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-semibold active:scale-95 transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-delete-btn"
            onClick={onConfirm}
            className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs bg-error text-on-error hover:bg-error/90 hover:shadow-[0_0_16px_rgba(255,180,171,0.35)] active:scale-95 transition-all duration-150"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;

