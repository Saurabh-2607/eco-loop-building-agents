from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_simulation():
    return {
        "run_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "status": "running",
        "speed_multiplier": 10.0,
        "elapsed_sim_seconds": 86400,
        "current_file": "small_office.idf"
    }
