from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

class Optimization(SQLModel, table=True):
    __tablename__: str = "optimizations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    simulation_id: UUID = Field(..., foreign_key="simulations.id", index=True)
    energy_before: float
    energy_after: float
    saving_percent: float
    comfort_score: float
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    simulation: "Simulation" = Relationship(back_populates="optimizations")
