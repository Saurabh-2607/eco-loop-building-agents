from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class MetricCreate(BaseModel):
    simulation_id: UUID
    temperature: float
    humidity: float
    occupancy: float
    energy_usage: float
    hvac_load: float
    lighting_load: float

class MetricResponse(BaseModel):
    id: int
    simulation_id: UUID
    temperature: float
    humidity: float
    occupancy: float
    energy_usage: float
    hvac_load: float
    lighting_load: float
    recorded_at: datetime

    class Config:
        from_attributes = True
