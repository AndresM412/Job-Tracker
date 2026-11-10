import React, { useState, useEffect } from "react";
import { type JobApplication, type JobNote } from "../../types/job";
import StatusBadge from "../ui/StatusBadge";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import NoteModal from "./NoteModal";
import ConfirmDeleteNoteModal from "./ConfirmDeleteNoteModal";
import JobDescriptionModal from "./JobDescriptionModal";
import * as jobsApi from "../../services/jobsApi";

interface JobDetailViewProps {
  job: JobApplication;
  onBack: () => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
  onJobUpdated?: (updatedJob: JobApplication) => void;
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

function isDescriptionLong(desc?: string): boolean {
  if (!desc) return false;
  // Si supera ~150 caracteres o contiene 3 o más saltos de línea, excede la vista de 3 líneas
  return desc.length > 150 || (desc.match(/\n/g) || []).length >= 3;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  onBack,
  onEdit,
  onDelete,
  onJobUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "notes">("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notes, setNotes] = useState<JobNote[]>(
    Array.isArray(job.notes) ? job.notes : []
  );

  // Estados para Job Description modal unificado (view/edit)
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [descriptionModalInitialMode, setDescriptionModalInitialMode] = useState<"view" | "edit">("view");

  // Estados para búsqueda y paginación de notas (4 notas por página en cuadrícula simétrica de 2x2)
  const [notesSearchQuery, setNotesSearchQuery] = useState("");
  const [currentNotesPage, setCurrentNotesPage] = useState(1);
  const notesPerPage = 4;

  // Estados para modal unificado de notas (view/edit)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<JobNote | null>(null);
  const [noteModalInitialMode, setNoteModalInitialMode] = useState<"view" | "edit">("view");

  // Estado para confirmación de eliminación consistente
  const [noteToDelete, setNoteToDelete] = useState<JobNote | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Mantener notas sincronizadas si el prop job cambia
  useEffect(() => {
    if (Array.isArray(job.notes)) {
      setNotes(job.notes);
    }
  }, [job.notes, job.id]);

  // Filtrado de notas por título
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(notesSearchQuery.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage) || 1;
  const startIndex = (currentNotesPage - 1) * notesPerPage;
  const paginatedNotes = filteredNotes.slice(
    startIndex,
    startIndex + notesPerPage
  );

  const handleOpenAddNote = () => {
    setSelectedNote(null);
    setNoteModalInitialMode("edit");
    setIsNoteModalOpen(true);
  };

  const handleOpenViewNote = (note: JobNote) => {
    setSelectedNote(note);
    setNoteModalInitialMode("view");
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (note: JobNote) => {
    setSelectedNote(note);
    setNoteModalInitialMode("edit");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (data: { title: string; content: string }) => {
    if (selectedNote) {
      const updated = await jobsApi.updateJobNote(job.id, selectedNote.id, data);
      const newNotes = notes.map((n) => (n.id === updated.id ? updated : n));
      setNotes(newNotes);
      setSelectedNote(updated);
      onJobUpdated?.({ ...job, notes: newNotes });
    } else {
      const created = await jobsApi.addJobNote(job.id, data);
      const newNotes = [created, ...notes];
      setNotes(newNotes);
      onJobUpdated?.({ ...job, notes: newNotes });
    }
  };

  const handleDeleteNoteConfirm = async () => {
    if (!noteToDelete) return;
    try {
      setIsDeletingNote(true);
      await jobsApi.deleteJobNote(job.id, noteToDelete.id);
      const newNotes = notes.filter((n) => n.id !== noteToDelete.id);
      setNotes(newNotes);
      onJobUpdated?.({ ...job, notes: newNotes });
      if (selectedNote?.id === noteToDelete.id) {
        setIsNoteModalOpen(false);
        setSelectedNote(null);
      }
      setNoteToDelete(null);

      // Ajustar página si la actual queda vacía
      const remainingFiltered = filteredNotes.filter((n) => n.id !== noteToDelete.id);
      const newTotalPages = Math.ceil(remainingFiltered.length / notesPerPage) || 1;
      if (currentNotesPage > newTotalPages) {
        setCurrentNotesPage(newTotalPages);
      }
    } finally {
      setIsDeletingNote(false);
    }
  };

  // Guardar descripción en backend desde el modal
  const handleSaveDescription = async (newDescription: string) => {
    const updated = await jobsApi.updateJob({
      ...job,
      description: newDescription || undefined,
    });
    onJobUpdated?.(updated);
  };

  const handleOpenDescriptionModal = (initialMode: "view" | "edit") => {
    setDescriptionModalInitialMode(initialMode);
    setIsDescriptionModalOpen(true);
  };

  // Componente de Notas (con proporciones refinadas y organizadas en cuadrícula de 2 columnas)
  const renderNotesSection = () => (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between h-full flex-1">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold">
              Notes
            </h2>
            <span
              data-testid="notes-count-badge"
              className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-surface-container-high text-primary-container border border-outline-variant/30"
            >
              {notes.length}
            </span>
          </div>

          {/* Botón Add Note: visible únicamente cuando ya existen notas registradas */}
          {notes.length > 0 && (
            <button
              type="button"
              data-testid="add-note-btn"
              onClick={handleOpenAddNote}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-container hover:text-primary-container/80 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                add
              </span>
              <span>Add Note</span>
            </button>
          )}
        </div>

        {/* Buscador de notas por título con lupa proporcionada */}
        {notes.length > 0 && (
          <div className="relative mb-2 max-w-xs">
            <span
              className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline/60 text-[13px] pointer-events-none select-none"
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
              className="w-full bg-surface-container-lowest/80 text-on-surface text-[11px] pl-6.5 pr-6 py-1 rounded-md border border-outline-variant/30 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline/60"
            />
            {notesSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setNotesSearchQuery("");
                  setCurrentNotesPage(1);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 rounded-full"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[11px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Listado de Tarjetas en Cuadrícula de 2 columnas o Estado Vacío */}
        {notes.length > 0 ? (
          filteredNotes.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5"
              data-testid="notes-list"
            >
              {paginatedNotes.map((note) => (
                <div
                  key={note.id}
                  data-testid={`note-card-${note.id}`}
                  onClick={() => handleOpenViewNote(note)}
                  className="group bg-surface-container-lowest/70 border border-outline-variant/25 hover:border-primary-container/50 hover:bg-surface-container-lowest rounded-lg p-2.5 transition-all cursor-pointer flex flex-col justify-between"
                  title="Click to view full note details"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-on-surface tracking-tight truncate flex-1 group-hover:text-primary-container transition-colors">
                        {note.title}
                      </h3>

                      {/* Botones de acción refinados y sutiles */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          data-testid={`edit-note-btn-${note.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditNote(note);
                          }}
                          className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                          title="Edit note"
                          aria-label={`Edit note ${note.title}`}
                        >
                          <span
                            className="material-symbols-outlined text-[13px] block"
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
                            setNoteToDelete(note);
                          }}
                          className="p-1 rounded text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                          title="Delete note"
                          aria-label={`Delete note ${note.title}`}
                        >
                          <span
                            className="material-symbols-outlined text-[13px] block"
                            aria-hidden="true"
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] sm:text-xs text-on-surface-variant line-clamp-2 break-words leading-relaxed">
                      {renderFormattedNotes(note.content)}
                    </div>
                  </div>

                  {note.createdAt && (
                    <div className="text-[10px] text-outline text-right mt-1.5 pt-0.5 border-t border-outline-variant/10">
                      {formatNoteDate(note.createdAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest/40 border border-outline-variant/20 rounded-lg p-3 text-center text-xs text-on-surface-variant">
              <p className="text-[11px]">No notes matched "{notesSearchQuery}".</p>
              <button
                type="button"
                onClick={() => setNotesSearchQuery("")}
                className="text-primary-container underline mt-1 inline-block cursor-pointer font-medium text-[11px]"
              >
                Clear search
              </button>
            </div>
          )
        ) : (
          /* Empty State */
          <div
            data-testid="notes-empty-state"
            className="bg-surface-container-lowest/40 border border-dashed border-outline-variant/30 rounded-lg p-4 sm:p-5 text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-outline mx-auto mb-1.5">
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
                sticky_note_2
              </span>
            </div>
            <h3 className="text-xs font-semibold text-on-surface mb-0.5">
              No notes recorded yet
            </h3>
            <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto mb-2 leading-relaxed">
              Log recruiter feedback, technical loop questions, or interview takeaways.
            </p>
            <button
              type="button"
              data-testid="add-first-note-btn"
              onClick={handleOpenAddNote}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-container text-on-primary-container text-xs font-medium hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                add
              </span>
              <span>Add First Note</span>
            </button>
          </div>
        )}
      </div>

      {/* Paginación anclada al pie */}
      {totalPages > 1 && filteredNotes.length > 0 && (
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <span className="text-[10px] text-outline">
            Showing {startIndex + 1}–
            {Math.min(startIndex + notesPerPage, filteredNotes.length)}{" "}
            of {filteredNotes.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentNotesPage === 1}
              onClick={() => setCurrentNotesPage((p) => p - 1)}
              className="px-2 py-0.5 rounded border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[10px]"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentNotesPage(pageNum)}
                  className={`w-5 h-5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    currentNotesPage === pageNum
                      ? "bg-primary-container text-on-primary-container"
                      : "hover:bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              type="button"
              disabled={currentNotesPage === totalPages}
              onClick={() => setCurrentNotesPage((p) => p + 1)}
              className="px-2 py-0.5 rounded border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[10px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      data-testid="job-detail-view"
      className="w-full flex-1 flex flex-col justify-between space-y-2 sm:space-y-2.5 min-h-0"
    >
      {/* Botón Volver a la Lista de Aplicaciones */}
      <div className="flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onBack}
          data-testid="back-to-applications-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface px-2.5 py-1 rounded-lg hover:bg-surface-container border border-outline-variant/30 transition-all cursor-pointer group"
        >
          <span
            className="material-symbols-outlined text-[15px] group-hover:-translate-x-0.5 transition-transform"
            aria-hidden="true"
          >
            arrow_back
          </span>
          <span>Back to Applications</span>
        </button>
      </div>

      {/* Hero Header Card (Composición fluida y equilibrada) */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Emblema de la empresa */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center font-bold text-lg sm:text-xl text-on-surface shrink-0 shadow-[0_0_12px_rgba(129,140,248,0.12)]">
              {job.company.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight truncate">
                  {job.company}
                </h1>
                <StatusBadge status={job.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                <span className="font-medium truncate max-w-[220px]">
                  {job.position}
                </span>
                <span className="text-outline/40 hidden sm:inline">•</span>
                <span className="text-[11px] text-on-surface-variant/80 hidden sm:inline">
                  Applied on {job.applicationDate}
                </span>

                {job.salary && (
                  <>
                    <span className="text-outline/40 hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-semibold text-[11px] border border-outline-variant/30">
                      <span
                        className="material-symbols-outlined text-[12px] text-outline"
                        aria-hidden="true"
                      >
                        payments
                      </span>
                      <span>{job.salary}</span>
                    </span>
                  </>
                )}

                {job.round && (
                  <>
                    <span className="text-outline/40 hidden sm:inline">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold text-[10px] uppercase font-mono tracking-wider border border-outline-variant/30">
                      {job.round}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Acciones principales: Edit y Delete */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="detail-edit-job-btn"
              onClick={() => onEdit(job)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant/60 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                edit
              </span>
              <span>Edit</span>
            </button>
            <button
              type="button"
              data-testid="detail-delete-job-btn"
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 rounded-lg bg-error-container/20 hover:bg-error-container/40 text-error border border-error/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                delete
              </span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs (Overview | Notes) */}
      <div className="flex items-center gap-6 border-b border-outline-variant/20 px-1 text-xs sm:text-sm font-semibold text-on-surface-variant shrink-0">
        <button
          type="button"
          onClick={() => {
            setActiveTab("overview");
            setCurrentNotesPage(1);
          }}
          className={`pb-1.5 transition-all relative cursor-pointer ${
            activeTab === "overview"
              ? "text-primary-container font-bold"
              : "hover:text-on-surface"
          }`}
        >
          Overview
          {activeTab === "overview" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("notes");
            setCurrentNotesPage(1);
          }}
          className={`pb-1.5 transition-all relative cursor-pointer flex items-center gap-1.5 ${
            activeTab === "notes"
              ? "text-primary-container font-bold"
              : "hover:text-on-surface"
          }`}
        >
          <span>Notes</span>
          {notes.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-surface-container-high text-primary-container">
              {notes.length}
            </span>
          )}
          {activeTab === "notes" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container rounded-full" />
          )}
        </button>
      </div>

      {/* Grid Layout según la pestaña activa */}
      {activeTab === "overview" && (
        <div className="flex-1 flex flex-col justify-between space-y-2 sm:space-y-2.5 min-h-0">
          {/* Fila 1: Application Overview (7 cols) + Job Description (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch shrink-0">
            {/* Ficha Técnica / Application Overview */}
            <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 sm:p-3.5 shadow-sm">
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-outline font-semibold mb-1.5">
                Application Overview
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className="text-outline text-[10px] block">Company</span>
                  <span className="font-semibold text-on-surface text-xs sm:text-sm truncate block">
                    {job.company}
                  </span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Role / Position</span>
                  <span className="font-semibold text-on-surface text-xs sm:text-sm truncate block">
                    {job.position}
                  </span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Status</span>
                  <span className="font-semibold text-on-surface text-xs sm:text-sm block">
                    {job.status}
                  </span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Date Applied</span>
                  <span className="font-semibold text-on-surface text-xs sm:text-sm block">
                    {job.applicationDate}
                  </span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Compensation</span>
                  <span className="font-semibold text-on-surface text-xs sm:text-sm truncate block">
                    {job.salary || "Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-outline text-[10px] block">Stage / Round</span>
                  <span className="font-semibold text-on-surface text-xs sm:text-sm truncate block">
                    {job.round || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Description (Fiel al mockup screen.png) */}
            <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 sm:p-3.5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="material-symbols-outlined text-primary-container text-[16px]"
                      aria-hidden="true"
                    >
                      description
                    </span>
                    <h2 className="text-[11px] font-mono uppercase tracking-wider text-outline font-semibold">
                      Job Description
                    </h2>
                  </div>

                  {job.description && (
                    <button
                      type="button"
                      data-testid="edit-description-btn"
                      onClick={() => handleOpenDescriptionModal("edit")}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-container hover:text-primary-container/80 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                        edit
                      </span>
                      <span>Update</span>
                    </button>
                  )}
                </div>

                {job.description ? (
                  <div>
                    {isDescriptionLong(job.description) ? (
                      <>
                        <div className="text-xs text-on-surface-variant line-clamp-3 break-words leading-relaxed">
                          {job.description}
                        </div>
                        <button
                          type="button"
                          data-testid="view-full-description-btn"
                          onClick={() => handleOpenDescriptionModal("view")}
                          className="mt-1 text-[11px] text-primary-container hover:brightness-125 font-medium cursor-pointer transition-colors block"
                        >
                          Read more
                        </button>
                      </>
                    ) : (
                      <div className="text-xs text-on-surface-variant break-words leading-relaxed">
                        {job.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2.5 text-center flex flex-col items-center justify-center">
                    <p className="text-[11px] text-outline mb-1.5">
                      No job description added yet.
                    </p>
                    <button
                      type="button"
                      data-testid="add-description-btn"
                      onClick={() => handleOpenDescriptionModal("edit")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-medium border border-outline-variant/40 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                        add
                      </span>
                      <span>Add Description</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fila 2: Sección de Notes (ocupa el ancho inferior en cuadrícula de 2 columnas) */}
          <div className="flex-1 min-h-0 flex flex-col">
            {renderNotesSection()}
          </div>
        </div>
      )}

      {/* Pestaña dedicada Notes */}
      {activeTab === "notes" && (
        <div className="w-full flex-1">
          {renderNotesSection()}
        </div>
      )}

      {/* Modal unificado para Lectura/Edición de Job Description */}
      <JobDescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        description={job.description || ""}
        company={job.company}
        position={job.position}
        initialMode={descriptionModalInitialMode}
        onSave={handleSaveDescription}
      />

      {/* Modal unificado para Lectura/Creación/Edición de Notas */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
        initialMode={noteModalInitialMode}
        onSubmit={handleSaveNote}
        onDelete={(note) => {
          setNoteToDelete(note);
        }}
      />

      {/* Modal de Confirmación para Eliminar Nota */}
      {noteToDelete && (
        <ConfirmDeleteNoteModal
          note={noteToDelete}
          onConfirm={handleDeleteNoteConfirm}
          onCancel={() => setNoteToDelete(null)}
          isDeleting={isDeletingNote}
        />
      )}

      {/* Modal de confirmación para eliminar la vacante completa */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          job={job}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDelete(job);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default JobDetailView;
