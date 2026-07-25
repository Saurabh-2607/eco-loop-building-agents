from typing import List, Dict, Any

class MetricsService:
    def __init__(self, repository=None):
        self.repository = repository

    async def get_latest_metrics(self) -> Dict[str, Any]:
        """
        Get the most recent simulation state metrics.
        """
        # Mock data return
        return {
            "timestamp": "2026-07-25T17:59:00Z",
            "run_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            "indoor_temp": 22.4,
            "outdoor_temp": 28.1,
            "relative_humidity": 45.5,
            "occupancy_count": 8.0,
            "pmv": -0.12,
            "ppd": 5.4,
            "hvac_power_kw": 18.2,
            "lighting_power_kw": 4.5
        }

    async def get_historical_metrics(self, run_id: str, limit: int = 100) -> Dict[str, Any]:
        """
        Retrieve a list of historical metrics.
        """
        # Mock data return
        return {
            "run_id": run_id,
            "records_count": 2,
            "data": [
                {
                    "timestamp": "2026-07-25T17:50:00Z",
                    "indoor_temp": 22.2,
                    "hvac_power_kw": 19.5
                },
                {
                    "timestamp": "2026-07-25T17:55:00Z",
                    "indoor_temp": 22.4,
                    "hvac_power_kw": 18.2
                }
            ]
        }
