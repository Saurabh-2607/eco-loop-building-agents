from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class DBLog(SQLModel, table=True):
    __tablename__: str = "db_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    level: str = Field(..., max_length=50)
    source: str = Field(..., max_length=100)
    message: str = Field(..., max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
