from pydantic import BaseModel, field_validator


class CommentCreate(BaseModel):
    body: str

    @field_validator("body")
    @classmethod
    def check_body(cls, v):
        if not v.strip():
            raise ValueError("body can't be empty")
        return v.strip()
