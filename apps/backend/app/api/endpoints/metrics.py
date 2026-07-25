from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_metrics():
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
