from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime


# --- Schemas para JobNote (Post-its) ---


class JobNoteBase(BaseModel):
    title: str
    content: str


class JobNoteCreate(JobNoteBase):
    pass


class JobNoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class JobNoteResponse(JobNoteBase):
    id: str
    job_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Schemas para JobApplication (Carpeta) ---


class JobApplicationBase(BaseModel):
    company: str
    position: str
    status: str
    application_date: date
    salary: Optional[str] = None
    round: Optional[str] = None
    description: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    notes: Optional[str] = None


class JobApplicationResponse(JobApplicationBase):
    id: str
    created_at: Optional[datetime] = None
    notes: List[JobNoteResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Schemas para Usuario y Auth ---


class UserBase(BaseModel):
    email: str
    password: str


class UserCreate(UserBase):
    pass


class UserResponse(BaseModel):
    id: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class UserLogin(UserBase):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str
