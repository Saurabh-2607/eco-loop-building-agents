from loguru import logger
from app.utils.background_tasks import active_overrides

class EnergyPlusController:
    @staticmethod
    def apply_hvac_override(setpoint: float):
        logger.info(f"EnergyPlus Controller: Applying HVAC setpoint override target = {setpoint}°C")
        active_overrides["hvac_setpoint"] = float(setpoint)

    @staticmethod
    def apply_lighting_override(dim_level: int):
        logger.info(f"EnergyPlus Controller: Applying Lighting override target = {dim_level}%")
        active_overrides["lighting_dim"] = int(dim_level)

    @staticmethod
    def get_current_overrides() -> dict:
        return {
            "hvac_setpoint": active_overrides.get("hvac_setpoint", 22.0),
            "lighting_dim": active_overrides.get("lighting_dim", 80)
        }

energyplus_controller = EnergyPlusController()
