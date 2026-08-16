from sqlalchemy import Column, String, Date
from app.database import Base


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(String, primary_key=True, index=True)
    company = Column(String(30), nullable=False)
    position = Column(String(40), nullable=False)
    status = Column(String, nullable=False)
    application_date = Column(Date, nullable=False)
    notes = Column(String, nullable=True)