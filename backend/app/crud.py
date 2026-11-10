import uuid
from sqlalchemy.orm import Session
from app import models, schemas, auth

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


def update_job(
    db: Session,
    job_id: str,
    job: schemas.JobApplicationCreate,
    user_id: str,
):
    db_job = get_job(db, job_id, user_id)
    if db_job is None:
        return None

    job_data = job.model_dump()
    job_data.pop("notes", None)  # Las notas se gestionan a través de sus endpoints dedicados

    for key, value in job_data.items():
        setattr(db_job, key, value)

    db.commit()
    db.refresh(db_job)
    return db_job


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
