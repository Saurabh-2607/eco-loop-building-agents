from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class SimulationCreate(BaseModel):
    simulation_name: str = Field(..., max_length=255, description="Descriptive name of simulation weather/idf profile")

class SimulationUpdate(BaseModel):
    status: str = Field(..., max_length=50, description="Active running status of the simulation")

class SimulationResponse(BaseModel):
    id: UUID
    simulation_name: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
