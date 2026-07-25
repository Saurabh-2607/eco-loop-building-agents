from typing import Dict, Any

class SimulationService:
    def __init__(self, repository=None):
        self.repository = repository

    async def get_simulation_status(self) -> Dict[str, Any]:
        """
        Get the current execution state of the simulator.
        """
        return {
            "run_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            "status": "running",
            "speed_multiplier": 10.0,
            "elapsed_sim_seconds": 86400,
            "current_file": "small_office.idf"
        }

    async def update_simulation_control(self, hvac_setpoint: float, lighting_dim: int) -> Dict[str, Any]:
        """
        Applies direct manual setpoint controls.
        """
        return {
            "status": "success",
            "applied": {
                "hvac_setpoint": hvac_setpoint,
                "lighting_dim": lighting_dim
            },
            "timestamp": "2026-07-25T17:59:15Z"
        }
