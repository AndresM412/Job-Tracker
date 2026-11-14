import React, { useState, useEffect } from "react";
import { type JobApplication, type JobNote } from "../../types/job";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import NoteModal from "./NoteModal";
import ConfirmDeleteNoteModal from "./ConfirmDeleteNoteModal";
import JobDescriptionModal from "./JobDescriptionModal";
import OfficeMapModal from "./OfficeMapModal";
import * as jobsApi from "../../services/jobsApi";
import JobDetailHeader from "./job-detail/JobDetailHeader";
import JobDetailOverview from "./job-detail/JobDetailOverview";
import JobDescriptionCard from "./job-detail/JobDescriptionCard";
import JobNotesSection from "./job-detail/JobNotesSection";

interface JobDetailViewProps {
  job: JobApplication;
  onBack: () => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
  onJobUpdated?: (updatedJob: JobApplication) => void;
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

  // Estados para modal unificado de notas (view/edit)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<JobNote | null>(null);
  const [noteModalInitialMode, setNoteModalInitialMode] = useState<"view" | "edit">("view");

  // Estado para confirmación de eliminación consistente de notas
  const [noteToDelete, setNoteToDelete] = useState<JobNote | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Estados para mapa de oficina
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Sincronizar notas si el prop job cambia
  useEffect(() => {
    if (Array.isArray(job.notes)) {
      setNotes(job.notes);
    }
  }, [job.notes, job.id]);

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
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleSaveDescription = async (newDescription: string) => {
    const updated = await jobsApi.patchJob(job.id, {
      description: newDescription.trim() || null,
    });
    onJobUpdated?.(updated);
  };

  const handleSaveOffice = async (office: {
    officeAddress: string | null;
    officeLat: number | null;
    officeLng: number | null;
  }) => {
    const updated = await jobsApi.patchJob(job.id, office);
    onJobUpdated?.(updated);
  };

  const handleOpenDescriptionModal = (initialMode: "view" | "edit") => {
    setDescriptionModalInitialMode(initialMode);
    setIsDescriptionModalOpen(true);
  };

  return (
    <div
      data-testid="job-detail-view"
      className="w-full flex-1 flex flex-col justify-between space-y-2 sm:space-y-2.5 min-h-0"
    >
      {/* 1. Cabecera (Hero, Identidad, Estrellas estáticas, Acciones y Tabs) */}
      <JobDetailHeader
        job={job}
        onBack={onBack}
        onEdit={() => onEdit(job)}
        onDelete={() => setShowDeleteModal(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notesCount={notes.length}
      />

      {/* 2. Disposición según la pestaña activa */}
      {activeTab === "overview" && (
        <div className="flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3 min-h-0">
          {/* Fila 1: Application Overview (7 cols) + Job Description (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch shrink-0">
            <JobDetailOverview
              job={job}
              onOpenMap={() => setIsMapModalOpen(true)}
            />
            <JobDescriptionCard
              description={job.description}
              onOpenModal={handleOpenDescriptionModal}
            />
          </div>

          {/* Fila 2: Sección de Notes (ancho completo inferior con State Colocation) */}
          <div className="flex-1 min-h-0 flex flex-col">
            <JobNotesSection
              notes={notes}
              onAddNote={handleOpenAddNote}
              onViewNote={handleOpenViewNote}
              onEditNote={handleOpenEditNote}
              onDeleteNote={(note) => setNoteToDelete(note)}
            />
          </div>
        </div>
      )}

      {/* Pestaña dedicada Notes */}
      {activeTab === "notes" && (
        <div className="w-full flex-1">
          <JobNotesSection
            notes={notes}
            onAddNote={handleOpenAddNote}
            onViewNote={handleOpenViewNote}
            onEditNote={handleOpenEditNote}
            onDeleteNote={(note) => setNoteToDelete(note)}
          />
        </div>
      )}

      {/* 3. Diálogos Modales Orquestados */}
      <JobDescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        description={job.description || ""}
        company={job.company}
        position={job.position}
        initialMode={descriptionModalInitialMode}
        onSave={handleSaveDescription}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
        initialMode={noteModalInitialMode}
        onSubmit={handleSaveNote}
        onDelete={(note) => setNoteToDelete(note)}
      />

      {noteToDelete && (
        <ConfirmDeleteNoteModal
          note={noteToDelete}
          onConfirm={handleDeleteNoteConfirm}
          onCancel={() => setNoteToDelete(null)}
          isDeleting={isDeletingNote}
        />
      )}

      <OfficeMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        company={job.company}
        location={job.location}
        officeAddress={job.officeAddress}
        officeLat={job.officeLat}
        officeLng={job.officeLng}
        onSaveOffice={handleSaveOffice}
      />

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
