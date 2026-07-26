from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Text

class AIDecision(SQLModel, table=True):
    __tablename__: str = "ai_decisions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    simulation_id: UUID = Field(..., foreign_key="simulations.id", index=True)
    prompt: str = Field(..., max_length=2000)
    reasoning: str = Field(sa_column=Column(Text))
    action: str = Field(sa_column=Column(Text))
    confidence: float = Field(default=1.0)
    model: str = Field(..., max_length=100)
    latency: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    simulation: "Simulation" = Relationship(back_populates="ai_decisions")
