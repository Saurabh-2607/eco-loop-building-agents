from typing import List, Optional
from app.optimization.schemas import BuildingFeatures, Recommendation
from app.optimization.constants import (
    TEMP_HIGH_THRESHOLD,
    TEMP_LOW_THRESHOLD,
    HUMIDITY_HIGH_THRESHOLD,
    LIGHTING_PERCENT_THRESHOLD,
    LOW_OCCUPANCY_THRESHOLD,
    PEAK_HOURS_START,
    PEAK_HOURS_END
)

class BaseRule:
    def evaluate(self, features: BuildingFeatures) -> Optional[Recommendation]:
        raise NotImplementedError

class CoolingSetpointRule(BaseRule):
    def evaluate(self, features: BuildingFeatures) -> Optional[Recommendation]:
        if features.avg_temperature > TEMP_HIGH_THRESHOLD and features.cooling_hours > 5:
            return Recommendation(
                category="HVAC",
                priority="HIGH",
                recommendation="Increase cooling setpoint by 1.0°C during warm/occupied intervals.",
                estimated_savings_percent=8.4,
                confidence=0.93
            )
        return None

class HeatingSetpointRule(BaseRule):
    def evaluate(self, features: BuildingFeatures) -> Optional[Recommendation]:
        if features.avg_temperature < TEMP_LOW_THRESHOLD and features.heating_hours > 5:
            return Recommendation(
                category="HVAC",
                priority="HIGH",
                recommendation="Decrease heating setpoint by 1.5°C during cold/unoccupied periods.",
                estimated_savings_percent=7.2,
                confidence=0.91
            )
        return None

class OccupancySetbackRule(BaseRule):
    def evaluate(self, features: BuildingFeatures) -> Optional[Recommendation]:
        if features.occupancy_rate < LOW_OCCUPANCY_THRESHOLD and features.hvac_energy_kwh > (features.total_energy_kwh * 0.35):
            return Recommendation(
                category="HVAC",
                priority="HIGH",
                recommendation="Implement HVAC schedule setbacks and reduce circulation during unoccupied intervals.",
                estimated_savings_percent=12.0,
                confidence=0.95
            )
        return None

class LightingDimmingRule(BaseRule):
    def evaluate(self, features: BuildingFeatures) -> Optional[Recommendation]:
        total_energy = features.total_energy_kwh
        if total_energy > 0 and (features.lighting_energy_kwh / total_energy) > LIGHTING_PERCENT_THRESHOLD:
            return Recommendation(
                category="Lighting",
                priority="MEDIUM",
                recommendation="Dim building interior lights to 70% during off-peak and off-office hours.",
                estimated_savings_percent=4.5,
                confidence=0.88
            )
        return None

class HumidityVentilationRule(BaseRule):
    def evaluate(self, features: BuildingFeatures) -> Optional[Recommendation]:
        if features.avg_humidity > HUMIDITY_HIGH_THRESHOLD:
            return Recommendation(
                category="HVAC",
                priority="MEDIUM",
                recommendation="Optimize outdoor air ventilation system flow to manage indoor humidity levels.",
                estimated_savings_percent=3.2,
                confidence=0.86
            )
        return None

class DemandResponseRule(BaseRule):
    def evaluate(self, features: BuildingFeatures) -> Optional[Recommendation]:
        if PEAK_HOURS_START <= features.peak_load_hour <= PEAK_HOURS_END:
            return Recommendation(
                category="Load Shifting",
                priority="MEDIUM",
                recommendation="Pre-cool building by 1.5°C before peak electrical demand pricing starts (12 PM - 5 PM).",
                estimated_savings_percent=6.5,
                confidence=0.89
            )
        return None

# Combined list of standard active rules
ALL_RULES: List[BaseRule] = [
    CoolingSetpointRule(),
    HeatingSetpointRule(),
    OccupancySetbackRule(),
    LightingDimmingRule(),
    HumidityVentilationRule(),
    DemandResponseRule()
]
