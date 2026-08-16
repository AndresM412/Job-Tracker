from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database import Base, engine, get_db
from app import models, schemas, crud

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Job Tracker API is running"}


@app.get("/jobs", response_model=List[schemas.JobApplicationResponse])
def read_jobs(db: Session = Depends(get_db)):
    return crud.get_jobs(db)


@app.post("/jobs", response_model=schemas.JobApplicationResponse)
def create_job(job: schemas.JobApplicationCreate, db: Session = Depends(get_db)):
    return crud.create_job(db, job)


@app.put("/jobs/{job_id}", response_model=schemas.JobApplicationResponse)
def update_job(job_id: str, job: schemas.JobApplicationCreate, db: Session = Depends(get_db)):
    db_job = crud.update_job(db, job_id, job)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


@app.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    db_job = crud.delete_job(db, job_id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}
