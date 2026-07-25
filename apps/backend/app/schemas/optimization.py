from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class AIDecisionCreate(BaseModel):
    simulation_id: UUID
    prompt: str
    reasoning: str
    action: str
    confidence: float
    model: str
    latency: float

class AIDecisionResponse(BaseModel):
    id: UUID
    simulation_id: UUID
    prompt: str
    reasoning: str
    action: str
    confidence: float
    model: str
    latency: float
    created_at: datetime

    class Config:
        from_attributes = True

class OptimizationCreate(BaseModel):
    simulation_id: UUID
    energy_before: float
    energy_after: float
    saving_percent: float
    comfort_score: float

class OptimizationResponse(BaseModel):
    id: UUID
    simulation_id: UUID
    energy_before: float
    energy_after: float
    saving_percent: float
    comfort_score: float
    created_at: datetime

    class Config:
        from_attributes = True
