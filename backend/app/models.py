from sqlalchemy import Column, String, Date, ForeignKey
from app.database import Base


class JobApplication(Base):
    __tablename__ = "job_applications"
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    id = Column(String, primary_key=True, index=True)
    company = Column(String(30), nullable=False)
    position = Column(String(40), nullable=False)
    status = Column(String, nullable=False)
    application_date = Column(Date, nullable=False)
    notes = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
