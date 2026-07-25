from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.metrics import MetricResponse
from app.schemas.simulation import SimulationResponse
from app.schemas.optimization import AIDecisionResponse, OptimizationResponse

class SystemStatusResponse(BaseModel):
    database: str
    api: str
    redis: str
    ollama: str
    version: str

class DashboardResponse(BaseModel):
    metrics: Optional[MetricResponse] = None
    simulation: Optional[SimulationResponse] = None
    recent_decisions: List[AIDecisionResponse] = []
    optimization: Optional[OptimizationResponse] = None
    system_status: SystemStatusResponse
