import uuid
from sqlalchemy.orm import Session
from app import models, schemas


def get_jobs(db: Session):
    return db.query(models.JobApplication).all()


def get_job(db: Session, job_id: str):
    return db.query(models.JobApplication).filter(models.JobApplication.id == job_id).first()


def create_job(db: Session, job: schemas.JobApplicationCreate):
    db_job = models.JobApplication(
        id=str(uuid.uuid4()),
        **job.model_dump()
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(db: Session, job_id: str, job: schemas.JobApplicationCreate):
    db_job = get_job(db, job_id)
    if db_job is None:
        return None
    for key, value in job.model_dump().items():
        setattr(db_job, key, value)
    db.commit()
    db.refresh(db_job)
    return db_job


def delete_job(db: Session, job_id: str):
    db_job = get_job(db, job_id)
    if db_job is None:
        return None
    db.delete(db_job)
    db.commit()
    return db_job