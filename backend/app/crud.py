import uuid
from sqlalchemy.orm import Session
from app import models, schemas, auth

# JOBS


def get_jobs(db: Session, user_id: str):
    return db.query(models.JobApplication).filter(models.JobApplication.user_id == user_id).all()


def get_job(db: Session, job_id: str, user_id: str):
    return db.query(models.JobApplication).filter(
        models.JobApplication.id == job_id,
        models.JobApplication.user_id == user_id
    ).first()


def create_job(db: Session, job: schemas.JobApplicationCreate, user_id: str):
    db_job = models.JobApplication(
        id=str(uuid.uuid4()),
        **job.model_dump(),
        user_id=user_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(db: Session, job_id: str, job: schemas.JobApplicationCreate, user_id: str):
    db_job = get_job(db, job_id, user_id)
    if db_job is None:
        return None
    for key, value in job.model_dump().items():
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

# USER


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=auth.hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
