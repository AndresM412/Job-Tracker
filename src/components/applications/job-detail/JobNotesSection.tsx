import React, { useState } from "react";
import { type JobNote } from "../../../types/job";

interface JobNotesSectionProps {
  notes: JobNote[];
  onAddNote: () => void;
  onViewNote: (note: JobNote) => void;
  onEditNote: (note: JobNote) => void;
  onDeleteNote: (note: JobNote) => void;
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

export const JobNotesSection: React.FC<JobNotesSectionProps> = ({
  notes,
  onAddNote,
  onViewNote,
  onEditNote,
  onDeleteNote,
}) => {
  // Estado local encapsulado (State Colocation): solo este componente se re-renderiza al buscar o paginar
  const [notesSearchQuery, setNotesSearchQuery] = useState("");
  const [currentNotesPage, setCurrentNotesPage] = useState(1);
  const notesPerPage = 4;

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(notesSearchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredNotes.length / notesPerPage) || 1;
  const safeCurrentPage = Math.min(currentNotesPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * notesPerPage;
  const paginatedNotes = filteredNotes.slice(
    startIndex,
    startIndex + notesPerPage,
  );

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between h-full flex-1">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-outline-variant/20 mb-3.5 sm:mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span
                className="material-symbols-outlined text-[17px]"
                aria-hidden="true"
              >
                sticky_note_2
              </span>
            </div>
            <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-on-surface">
              NOTES
            </h2>
            <span
              data-testid="notes-count-badge"
              className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-surface-container-highest border border-outline-variant/40 text-primary font-mono"
            >
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Buscador de notas por título con medidas exactas del inspector (31px, 256px, pl-36px, rounded 4px) */}
            {notes.length > 0 && (
              <div className="relative w-full sm:w-[256px]">
                <span
                  className="material-symbols-outlined absolute left-[11px] top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none select-none"
                  aria-hidden="true"
                >
                  search
                </span>
                <input
                  type="text"
                  data-testid="search-notes-input"
                  value={notesSearchQuery}
                  onChange={(e) => {
                    setNotesSearchQuery(e.target.value);
                    setCurrentNotesPage(1);
                  }}
                  placeholder="Search notes by title..."
                  className="w-full h-[31px] bg-[#0e0e10] text-[#e5e1e4] text-[12px] leading-[16.8px] pl-[36px] pr-[28px] py-[6px] rounded-[4px] border border-[#454653]/40 focus:border-primary focus:outline-none transition-all duration-150 placeholder:text-outline"
                />
                {notesSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotesSearchQuery("");
                      setCurrentNotesPage(1);
                    }}
                    className="absolute right-[8px] top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 rounded-full cursor-pointer"
                    title="Clear search"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      close
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Botón Add Note: proporciones exactas del prototipo con hover brillante (#e0e0ff + glow) */}
            {notes.length > 0 && (
              <button
                type="button"
                data-testid="add-note-btn"
                onClick={onAddNote}
                className="cursor-pointer shrink-0 inline-flex items-center justify-center gap-[6px] h-[28px] px-[14px] py-[6px] rounded-[4px] bg-[#bdc2ff] text-[#131e8c] text-[13px] leading-[13px] font-semibold tracking-[0.13px] shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-[0.98] transition-all duration-150"
              >
                <span
                  className="material-symbols-outlined text-[16px] leading-[16px] block select-none"
                  aria-hidden="true"
                >
                  add
                </span>
                <span className="text-[13px] leading-[13px] font-semibold tracking-[0.13px]">
                  Add Note
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Listado de Tarjetas en Cuadrícula de 2 columnas o Estado Vacío */}
        {notes.length > 0 ? (
          filteredNotes.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-h-[385px] content-start"
              data-testid="notes-list"
            >
              {paginatedNotes.map((note) => (
                <div
                  key={note.id}
                  data-testid={`note-card-${note.id}`}
                  className="group bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container/70 rounded-xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between shadow-xs min-h-[175px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base sm:text-[19px] font-bold text-on-surface tracking-tight truncate flex-1">
                        {note.title}
                      </h3>

                      {/* Botones de acción: medidas exactas del mockup (icono 16px) */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          data-testid={`edit-note-btn-${note.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditNote(note);
                          }}
                          className="p-1 rounded text-[#c6c5d5] hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Edit note"
                          aria-label={`Edit note ${note.title}`}
                        >
                          <span
                            className="material-symbols-outlined text-[16px] leading-none select-none"
                            aria-hidden="true"
                          >
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          data-testid={`delete-note-btn-${note.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note);
                          }}
                          className="p-1 rounded text-[#c6c5d5] hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Delete note"
                          aria-label={`Delete note ${note.title}`}
                        >
                          <span
                            className="material-symbols-outlined text-[16px] leading-none select-none"
                            aria-hidden="true"
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="font-body-md text-body-md text-on-surface-variant line-clamp-3 break-words leading-relaxed">
                      {renderFormattedNotes(note.content)}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-outline-variant/15 flex items-center justify-between text-outline text-[11px]">
                    <span className="font-mono flex items-center gap-1.5 text-outline">
                      <span
                        className="material-symbols-outlined text-[13px]"
                        aria-hidden="true"
                      >
                        schedule
                      </span>
                      <span>{formatNoteDate(note.createdAt)}</span>
                    </span>
                    <button
                      type="button"
                      data-testid={`read-note-btn-${note.id}`}
                      onClick={() => onViewNote(note)}
                      style={{
                        color: "rgb(189 194 255 / var(--tw-text-opacity, 1))",
                      }}
                      className="font-label-sm text-label-sm font-semibold hover:brightness-125 transition-all flex items-center gap-1 cursor-pointer group/note"
                      aria-label={`Read note ${note.title}`}
                    >
                      <span>Read note</span>
                      <span
                        className="material-symbols-outlined text-[13px] group-hover/note:translate-x-0.5 transition-transform duration-150"
                        aria-hidden="true"
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-center text-xs text-on-surface-variant">
              <p className="text-xs">No notes matched "{notesSearchQuery}".</p>
              <button
                type="button"
                onClick={() => setNotesSearchQuery("")}
                className="text-primary-container hover:text-primary mt-1.5 inline-block cursor-pointer font-semibold text-xs"
              >
                Clear search
              </button>
            </div>
          )
        ) : (
          /* Empty State */
          <div
            data-testid="notes-empty-state"
            className="bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-xl p-6 sm:p-7 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mb-4 shadow-inner mx-auto">
              <span
                className="material-symbols-outlined text-[28px] text-outline"
                aria-hidden="true"
              >
                sticky_note_2
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No notes recorded yet
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto mb-3.5 leading-relaxed">
              Log recruiter feedback, technical loop questions, or interview
              takeaways.
            </p>
            <button
              type="button"
              data-testid="add-first-note-btn"
              onClick={onAddNote}
              className="cursor-pointer shrink-0 inline-flex items-center justify-center gap-[6px] h-[28px] px-[14px] py-[6px] rounded-[4px] bg-[#bdc2ff] text-[#131e8c] text-[13px] leading-[13px] font-semibold tracking-[0.13px] shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-[0.98] transition-all duration-150"
            >
              <span
                className="material-symbols-outlined text-[16px] leading-[16px] block select-none"
                aria-hidden="true"
              >
                add
              </span>
              <span className="text-[13px] leading-[13px] font-semibold tracking-[0.13px]">
                Add First Note
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Paginación anclada al pie */}
      {totalPages > 1 && filteredNotes.length > 0 && (
        <div className="pt-3 mt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <span className="text-[11px] font-mono text-outline">
            Showing{" "}
            <span className="text-on-surface font-semibold">
              {startIndex + 1}
            </span>
            -
            <span className="text-on-surface font-semibold">
              {Math.min(startIndex + notesPerPage, filteredNotes.length)}
            </span>{" "}
            of{" "}
            <span className="text-on-surface font-semibold">
              {filteredNotes.length}
            </span>{" "}
            notes
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentNotesPage((p) => Math.max(p - 1, 1))}
              className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous page"
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined text-[16px] block">
                chevron_left
              </span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentNotesPage(page)}
                className={`min-w-6 h-6 px-1 text-xs font-mono rounded-md font-semibold transition-all cursor-pointer ${
                  safeCurrentPage === page
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentNotesPage((p) => Math.min(p + 1, totalPages))
              }
              className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next page"
              aria-label="Next page"
            >
              <span className="material-symbols-outlined text-[16px] block">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobNotesSection;
