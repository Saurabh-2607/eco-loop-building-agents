from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlmodel import SQLModel, Field, Relationship

class SimulationMetric(SQLModel, table=True):
    __tablename__: str = "simulation_metrics"

    id: Optional[int] = Field(default=None, primary_key=True)
    simulation_id: UUID = Field(..., foreign_key="simulations.id", index=True)
    temperature: float
    humidity: float
    occupancy: float
    energy_usage: float
    hvac_load: float
    lighting_load: float
    recorded_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    simulation: "Simulation" = Relationship(back_populates="metrics")
