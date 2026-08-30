from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database import Base, engine, get_db
from app import models, schemas, crud, auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.post("/register", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.post("/login", response_model=schemas.Token)
def user_login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)

    if db_user is None or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
