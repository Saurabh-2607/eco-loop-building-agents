from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_history():
    return {
        "run_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
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
