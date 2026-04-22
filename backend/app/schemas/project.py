from typing import Optional
from pydantic import BaseModel, field_validator


class ProjectCreate(BaseModel):
    name: str
    description: str = ""

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v):
        if not v.strip():
            raise ValueError("name can't be blank")
        return v.strip()


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v):
        if v is not None and not v.strip():
            raise ValueError("name can't be blank")
        return v.strip() if v else v
