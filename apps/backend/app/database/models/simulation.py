from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

class Simulation(SQLModel, table=True):
    __tablename__: str = "simulations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    simulation_name: str = Field(..., max_length=255)
    status: str = Field(default="idle", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    metrics: List["SimulationMetric"] = Relationship(back_populates="simulation", cascade_delete=True)
    ai_decisions: List["AIDecision"] = Relationship(back_populates="simulation", cascade_delete=True)
    optimizations: List["Optimization"] = Relationship(back_populates="simulation", cascade_delete=True)
