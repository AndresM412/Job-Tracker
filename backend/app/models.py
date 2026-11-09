from datetime import datetime, timezone
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class JobApplication(Base):
    __tablename__ = "job_applications"
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    id = Column(String, primary_key=True, index=True)
    company = Column(String(30), nullable=False)
    position = Column(String(40), nullable=False)
    status = Column(String, nullable=False)
    application_date = Column(Date, nullable=False)
    salary = Column(String(50), nullable=True)
    round = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    notes = relationship(
        "JobNote",
        back_populates="job",
        cascade="all, delete-orphan",
        order_by="JobNote.created_at.desc()",
    )


class JobNote(Base):
    __tablename__ = "job_notes"
    id = Column(String, primary_key=True, index=True)
    job_id = Column(
        String,
        ForeignKey("job_applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    job = relationship("JobApplication", back_populates="notes")


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
