from pydantic import BaseModel
from typing import List

class BuildingFeatures(BaseModel):
    avg_temperature: float
    peak_temperature: float
    min_temperature: float
    avg_humidity: float
    total_energy_kwh: float
    hvac_energy_kwh: float
    lighting_energy_kwh: float
    occupancy_rate: float
    peak_load_hour: int
    cooling_hours: int
    heating_hours: int

class Recommendation(BaseModel):
    category: str
    priority: str
    recommendation: str
    estimated_savings_percent: float
    confidence: float

class OptimizationReport(BaseModel):
    overall_score: float
    estimated_savings_percent: float
    recommendations: List[Recommendation]
