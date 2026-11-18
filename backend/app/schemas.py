from datetime import date, datetime
import re
from typing import List, Literal, Optional
from urllib.parse import urlparse
from pydantic import BaseModel, ConfigDict, Field, field_validator


WorkMode = Literal["Remote", "On-site", "Hybrid"]

_URI_SCHEME_RE = re.compile(r"^([a-zA-Z][a-zA-Z0-9+.-]*):")
_MAX_JOB_URL_LENGTH = 500


def normalize_and_validate_job_url(value: Optional[str]) -> Optional[str]:
    """
    Normaliza URLs sin protocolo anteponiendo https:// y rechaza esquemas
    distintos a http/https para prevenir inyección XSS (ej. javascript:).
    """
    if value is None:
        return None

    cleaned = value.strip()
    if not cleaned:
        return None

    if any(ch.isspace() for ch in cleaned):
        raise ValueError("Job URL cannot contain whitespace")

    if cleaned.startswith("//"):
        raise ValueError("Job URL must start with http:// or https://")

    scheme_match = _URI_SCHEME_RE.match(cleaned)
    if scheme_match:
        scheme = scheme_match.group(1).lower()
        if scheme not in ("http", "https"):
            raise ValueError("Only http:// and https:// URLs are allowed")
        if not cleaned.lower().startswith(("http://", "https://")):
            raise ValueError("Invalid URL format; expected http:// or https://")
        candidate = cleaned
    else:
        candidate = f"https://{cleaned}"

    if len(candidate) > _MAX_JOB_URL_LENGTH:
        raise ValueError(f"Job URL must be {_MAX_JOB_URL_LENGTH} characters or less")

    parsed = urlparse(candidate)
    hostname = parsed.hostname or ""
    if (
        parsed.scheme not in ("http", "https")
        or not hostname
        or "." not in hostname
        or hostname.startswith(".")
        or hostname.endswith(".")
    ):
        raise ValueError("Invalid job URL domain")

    return candidate


def clean_optional_text(value: Optional[str]) -> Optional[str]:
    """Convierte strings vacíos o de solo espacios en None."""
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


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


class _JobFieldsValidationMixin:
    """Validadores compartidos entre creación/reemplazo y actualización parcial."""

    @field_validator("job_url")
    @classmethod
    def validate_job_url(cls, value: Optional[str]) -> Optional[str]:
        return normalize_and_validate_job_url(value)

    @field_validator("location", "office_address")
    @classmethod
    def sanitize_optional_strings(cls, value: Optional[str]) -> Optional[str]:
        return clean_optional_text(value)

    @field_validator("work_mode", mode="before")
    @classmethod
    def normalize_work_mode(cls, value):
        if isinstance(value, str):
            return value.strip() or None
        return value


class JobApplicationBase(_JobFieldsValidationMixin, BaseModel):
    company: str
    position: str
    status: str
    application_date: date
    salary: Optional[str] = None
    round: Optional[str] = None
    description: Optional[str] = None
    job_url: Optional[str] = Field(default=None, max_length=_MAX_JOB_URL_LENGTH)
    priority: int = Field(default=0, ge=0, le=5)
    location: Optional[str] = Field(default=None, max_length=100)
    work_mode: Optional[WorkMode] = None
    office_address: Optional[str] = Field(default=None, max_length=255)
    office_lat: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    office_lng: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


class JobApplicationCreate(JobApplicationBase):
    notes: Optional[str] = None


class JobApplicationPatch(_JobFieldsValidationMixin, BaseModel):
    """Schema parcial para PATCH /jobs/{job_id}; solo modifica campos enviados."""

    company: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    application_date: Optional[date] = None
    salary: Optional[str] = None
    round: Optional[str] = None
    description: Optional[str] = None
    job_url: Optional[str] = Field(default=None, max_length=_MAX_JOB_URL_LENGTH)
    priority: Optional[int] = Field(default=None, ge=0, le=5)
    location: Optional[str] = Field(default=None, max_length=100)
    work_mode: Optional[WorkMode] = None
    office_address: Optional[str] = Field(default=None, max_length=255)
    office_lat: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    office_lng: Optional[float] = Field(default=None, ge=-180.0, le=180.0)

    @field_validator("company", "position", "status", "application_date", "priority")
    @classmethod
    def reject_null_required_fields(cls, value, info):
        if value is None:
            raise ValueError(f"Field '{info.field_name}' cannot be null")
        return value


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
