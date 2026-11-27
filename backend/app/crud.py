import uuid
from sqlalchemy.orm import Session
from app import models, schemas, auth

MAX_TIMELINE_EVENTS_PER_JOB = 10

# --- JOBS ---


def get_jobs(db: Session, user_id: str):
    return (
        db.query(models.JobApplication)
        .filter(models.JobApplication.user_id == user_id)
        .order_by(models.JobApplication.created_at.desc())
        .all()
    )


def get_job(db: Session, job_id: str, user_id: str):
    return (
        db.query(models.JobApplication)
        .filter(
            models.JobApplication.id == job_id,
            models.JobApplication.user_id == user_id,
        )
        .first()
    )


def create_job(db: Session, job: schemas.JobApplicationCreate, user_id: str):
    job_data = job.model_dump()
    initial_note = job_data.pop("notes", None)

    db_job = models.JobApplication(
        id=str(uuid.uuid4()),
        **job_data,
        user_id=user_id,
    )
    db.add(db_job)

    # Hito inicial del timeline
    initial_event = models.JobTimelineEvent(
        id=str(uuid.uuid4()),
        job_id=db_job.id,
        stage=db_job.status or "Applied",
        date=db_job.application_date,
        notes="Application submitted",
    )
    db.add(initial_event)

    # Si se proporcionó una nota inicial de texto, se crea automáticamente como el primer JobNote
    if initial_note and initial_note.strip():
        db_note = models.JobNote(
            id=str(uuid.uuid4()),
            job_id=db_job.id,
            title="Initial Notes",
            content=initial_note.strip(),
        )
        db.add(db_note)

    db.commit()
    db.refresh(db_job)
    return db_job


def _apply_job_field_updates(
    db: Session,
    job_id: str,
    job_payload: schemas.JobApplicationCreate | schemas.JobApplicationPatch,
    user_id: str,
):
    """Aplica actualizaciones totales o parciales respetando campos no enviados."""
    db_job = get_job(db, job_id, user_id)
    if db_job is None:
        return None

    previous_status = db_job.status

    # exclude_unset=True preserva campos omitidos (como priority, description u office_*)
    # mientras permite limpiar opcionales cuando se envían explícitamente como None.
    job_data = job_payload.model_dump(exclude_unset=True)
    job_data.pop("notes", None)  # Las notas se gestionan a través de sus endpoints dedicados

    for key, value in job_data.items():
        setattr(db_job, key, value)

    # Autogenerar hito en timeline si el estado cambió a una etapa sin registrar
    new_status = job_data.get("status")
    if new_status and new_status != previous_status:
        existing_event = (
            db.query(models.JobTimelineEvent)
            .filter(
                models.JobTimelineEvent.job_id == db_job.id,
                models.JobTimelineEvent.stage == new_status,
            )
            .first()
        )
        if not existing_event:
            existing_count = (
                db.query(models.JobTimelineEvent)
                .filter(models.JobTimelineEvent.job_id == db_job.id)
                .count()
            )
            if existing_count < MAX_TIMELINE_EVENTS_PER_JOB:
                from datetime import date
                auto_event = models.JobTimelineEvent(
                    id=str(uuid.uuid4()),
                    job_id=db_job.id,
                    stage=new_status,
                    date=date.today(),
                    notes=f"Moved to {new_status}",
                )
                db.add(auto_event)

    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(
    db: Session,
    job_id: str,
    job: schemas.JobApplicationCreate,
    user_id: str,
):
    return _apply_job_field_updates(db, job_id, job, user_id)


def patch_job(
    db: Session,
    job_id: str,
    job_patch: schemas.JobApplicationPatch,
    user_id: str,
):
    return _apply_job_field_updates(db, job_id, job_patch, user_id)


def delete_job(db: Session, job_id: str, user_id: str):
    db_job = get_job(db, job_id, user_id)
    if db_job is None:
        return None
    db.delete(db_job)
    db.commit()
    return db_job


# --- NOTES ---


def create_job_note(
    db: Session,
    job_id: str,
    note: schemas.JobNoteCreate,
    user_id: str,
):
    # Verificación de seguridad: el trabajo debe existir y pertenecer al usuario autenticado
    db_job = get_job(db, job_id, user_id)
    if not db_job:
        return None

    db_note = models.JobNote(
        id=str(uuid.uuid4()),
        job_id=job_id,
        title=note.title,
        content=note.content,
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def get_job_notes(db: Session, job_id: str, user_id: str):
    db_job = get_job(db, job_id, user_id)
    if not db_job:
        return None
    return (
        db.query(models.JobNote)
        .filter(models.JobNote.job_id == job_id)
        .order_by(models.JobNote.created_at.desc())
        .all()
    )


def get_job_note(db: Session, job_id: str, note_id: str, user_id: str):
    db_job = get_job(db, job_id, user_id)
    if not db_job:
        return None
    return (
        db.query(models.JobNote)
        .filter(
            models.JobNote.id == note_id,
            models.JobNote.job_id == job_id,
        )
        .first()
    )


def update_job_note(
    db: Session,
    job_id: str,
    note_id: str,
    note_update: schemas.JobNoteUpdate,
    user_id: str,
):
    db_note = get_job_note(db, job_id, note_id, user_id)
    if not db_note:
        return None

    if note_update.title is not None:
        db_note.title = note_update.title
    if note_update.content is not None:
        db_note.content = note_update.content

    db.commit()
    db.refresh(db_note)
    return db_note


def delete_job_note(db: Session, job_id: str, note_id: str, user_id: str):
    db_note = get_job_note(db, job_id, note_id, user_id)
    if not db_note:
        return None
    db.delete(db_note)
    db.commit()
    return db_note


# --- TIMELINE ---


def get_job_timeline(db: Session, job_id: str, user_id: str):
    db_job = get_job(db, job_id, user_id)
    if not db_job:
        return None
    return (
        db.query(models.JobTimelineEvent)
        .filter(models.JobTimelineEvent.job_id == job_id)
        .order_by(
            models.JobTimelineEvent.date.asc(),
            models.JobTimelineEvent.created_at.asc(),
        )
        .all()
    )


def get_job_timeline_event(db: Session, job_id: str, event_id: str, user_id: str):
    db_job = get_job(db, job_id, user_id)
    if not db_job:
        return None
    return (
        db.query(models.JobTimelineEvent)
        .filter(
            models.JobTimelineEvent.id == event_id,
            models.JobTimelineEvent.job_id == job_id,
        )
        .first()
    )


def create_job_timeline_event(
    db: Session,
    job_id: str,
    event: schemas.JobTimelineEventCreate,
    user_id: str,
):
    db_job = get_job(db, job_id, user_id)
    if not db_job:
        return None

    existing_count = (
        db.query(models.JobTimelineEvent)
        .filter(models.JobTimelineEvent.job_id == job_id)
        .count()
    )
    if existing_count >= MAX_TIMELINE_EVENTS_PER_JOB:
        raise ValueError(
            f"Maximum of {MAX_TIMELINE_EVENTS_PER_JOB} timeline milestones allowed per job"
        )

    db_event = models.JobTimelineEvent(
        id=str(uuid.uuid4()),
        job_id=job_id,
        stage=event.stage,
        date=event.date,
        notes=event.notes,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_job_timeline_event(
    db: Session,
    job_id: str,
    event_id: str,
    event_update: schemas.JobTimelineEventUpdate,
    user_id: str,
):
    db_event = get_job_timeline_event(db, job_id, event_id, user_id)
    if not db_event:
        return None

    if event_update.stage is not None:
        db_event.stage = event_update.stage
    if event_update.date is not None:
        db_event.date = event_update.date
    if event_update.notes is not None:
        db_event.notes = event_update.notes

    db.commit()
    db.refresh(db_event)
    return db_event


def delete_job_timeline_event(db: Session, job_id: str, event_id: str, user_id: str):
    db_event = get_job_timeline_event(db, job_id, event_id, user_id)
    if not db_event:
        return None
    db.delete(db_event)
    db.commit()
    return db_event


# --- USER ---


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=auth.hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def delete_user(db: Session, user: models.User):
    db.delete(user)
    db.commit()
    return user
