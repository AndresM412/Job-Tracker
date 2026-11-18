from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from typing import List

from app.database import Base, engine, get_db
from app import models, schemas, crud, auth

Base.metadata.create_all(bind=engine)


def _ensure_extra_job_columns() -> None:
    """Agrega columnas nuevas de forma idempotente si la BD ya existía (ej. Docker local)."""
    inspector = inspect(engine)
    if "job_applications" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("job_applications")}
    extra_columns = {
        "job_url": "VARCHAR(500)",
        "priority": "INTEGER NOT NULL DEFAULT 0",
        "location": "VARCHAR(100)",
        "work_mode": "VARCHAR(20)",
        "office_address": "VARCHAR(255)",
        "office_lat": "FLOAT",
        "office_lng": "FLOAT",
    }

    missing = [(name, ddl) for name, ddl in extra_columns.items() if name not in existing]
    if not missing:
        return

    with engine.begin() as conn:
        for col_name, col_ddl in missing:
            conn.execute(text(f"ALTER TABLE job_applications ADD COLUMN {col_name} {col_ddl}"))


_ensure_extra_job_columns()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- JOBS ENDPOINTS ---


@app.get("/jobs", response_model=List[schemas.JobApplicationResponse])
def read_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return crud.get_jobs(db, user_id=current_user.id)


@app.post("/jobs", response_model=schemas.JobApplicationResponse)
def create_job(
    job: schemas.JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return crud.create_job(db, job, user_id=current_user.id)


@app.put("/jobs/{job_id}", response_model=schemas.JobApplicationResponse)
def update_job(
    job_id: str,
    job: schemas.JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_job = crud.update_job(db, job_id, job, user_id=current_user.id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


@app.patch("/jobs/{job_id}", response_model=schemas.JobApplicationResponse)
def patch_job(
    job_id: str,
    job_patch: schemas.JobApplicationPatch,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Actualización parcial in-situ (ej. estrellas de prioridad o pin de oficina)."""
    db_job = crud.patch_job(db, job_id, job_patch, user_id=current_user.id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


@app.delete("/jobs/{job_id}")
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_job = crud.delete_job(db, job_id, user_id=current_user.id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}


# --- NOTES ENDPOINTS ---


@app.get("/jobs/{job_id}/notes", response_model=List[schemas.JobNoteResponse])
def read_job_notes(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    notes = crud.get_job_notes(db, job_id, user_id=current_user.id)
    if notes is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return notes


@app.post("/jobs/{job_id}/notes", response_model=schemas.JobNoteResponse)
def create_job_note(
    job_id: str,
    note: schemas.JobNoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_note = crud.create_job_note(db, job_id, note, user_id=current_user.id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_note


@app.put("/jobs/{job_id}/notes/{note_id}", response_model=schemas.JobNoteResponse)
def update_job_note(
    job_id: str,
    note_id: str,
    note: schemas.JobNoteUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_note = crud.update_job_note(db, job_id, note_id, note, user_id=current_user.id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note or Job not found")
    return db_note


@app.delete("/jobs/{job_id}/notes/{note_id}")
def delete_job_note(
    job_id: str,
    note_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_note = crud.delete_job_note(db, job_id, note_id, user_id=current_user.id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note or Job not found")
    return {"message": "Note deleted successfully"}


# --- AUTH ENDPOINTS ---


@app.post("/register", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)


@app.post("/login", response_model=schemas.Token)
def user_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(db, form_data.username)

    if db_user is None or not auth.verify_password(
        form_data.password, db_user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@app.delete("/users/me")
def delete_current_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    crud.delete_user(db, current_user)
    return {"message": "User deleted successfully"}
