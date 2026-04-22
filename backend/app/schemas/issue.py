from typing import Optional
from pydantic import BaseModel, field_validator

VALID_PRIORITIES = {"low", "medium", "high", "critical"}
VALID_STATUSES = {"open", "in_progress", "resolved", "closed"}


class IssueCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"

    @field_validator("title")
    @classmethod
    def check_title(cls, v):
        if not v.strip():
            raise ValueError("title can't be blank")
        return v.strip()

    @field_validator("priority")
    @classmethod
    def check_priority(cls, v):
        if v not in VALID_PRIORITIES:
            raise ValueError(f"got '{v}', expected one of {sorted(VALID_PRIORITIES)}")
        return v


class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None

    @field_validator("priority")
    @classmethod
    def check_priority(cls, v):
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"got '{v}', expected one of {sorted(VALID_PRIORITIES)}")
        return v


class IssueTransition(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def check_status(cls, v):
        if v not in VALID_STATUSES:
            raise ValueError(f"'{v}' is not a valid status")
        return v
