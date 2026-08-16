from pydantic import BaseModel
from typing import Optional
from datetime import date


class JobApplicationBase(BaseModel):
    company: str
    position: str
    status: str
    application_date: date
    notes: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationResponse(JobApplicationBase):
    id: str

    class Config:
        from_attributes = True