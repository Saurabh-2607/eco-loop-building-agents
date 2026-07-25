from pydantic import BaseModel, Field

class ControlOverrideRequest(BaseModel):
    hvac_setpoint: float = Field(..., description="Target HVAC setpoint temperature in °C", ge=18.0, le=28.0)
    lighting_dim: int = Field(..., description="Target lighting dimming level percentage", ge=0, le=100)
