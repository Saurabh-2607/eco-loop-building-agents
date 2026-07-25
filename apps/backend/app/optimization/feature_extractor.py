from typing import List
from app.database.models.metrics import SimulationMetric
from app.optimization.schemas import BuildingFeatures

class FeatureExtractor:
    @staticmethod
    def extract(metrics: List[SimulationMetric]) -> BuildingFeatures:
        """
        Analyze simulation telemetry and extract aggregated building performance features.
        """
        if not metrics:
            return BuildingFeatures(
                avg_temperature=22.0,
                peak_temperature=22.0,
                min_temperature=22.0,
                avg_humidity=50.0,
                total_energy_kwh=0.0,
                hvac_energy_kwh=0.0,
                lighting_energy_kwh=0.0,
                occupancy_rate=0.0,
                peak_load_hour=12,
                cooling_hours=0,
                heating_hours=0
            )

        temperatures = [m.temperature for m in metrics]
        humidities = [m.humidity for m in metrics]
        
        avg_temp = sum(temperatures) / len(temperatures)
        peak_temp = max(temperatures)
        min_temp = min(temperatures)
        avg_humidity = sum(humidities) / len(humidities)
        
        total_energy = sum(m.energy_usage for m in metrics)
        hvac_energy = sum(m.hvac_load for m in metrics)
        lighting_energy = sum(m.lighting_load for m in metrics)
        
        # Occupancy rate: fraction of hours where occupants are present (occupancy > 0)
        occupied_slots = sum(1 for m in metrics if m.occupancy > 0)
        occupancy_rate = occupied_slots / len(metrics)
        
        # Find peak load hour
        peak_metric = max(metrics, key=lambda m: m.energy_usage)
        peak_load_hour = peak_metric.recorded_at.hour
        
        # Cooling and heating hours count
        cooling_hours = sum(1 for m in metrics if m.temperature > 23.0 and m.hvac_load > 0.01)
        heating_hours = sum(1 for m in metrics if m.temperature < 20.0 and m.hvac_load > 0.01)
        
        return BuildingFeatures(
            avg_temperature=round(avg_temp, 2),
            peak_temperature=round(peak_temp, 2),
            min_temperature=round(min_temp, 2),
            avg_humidity=round(avg_humidity, 2),
            total_energy_kwh=round(total_energy, 2),
            hvac_energy_kwh=round(hvac_energy, 2),
            lighting_energy_kwh=round(lighting_energy, 2),
            occupancy_rate=round(occupancy_rate, 2),
            peak_load_hour=peak_load_hour,
            cooling_hours=cooling_hours,
            heating_hours=heating_hours
        )
