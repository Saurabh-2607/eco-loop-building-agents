from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_health():
    return {
        "status": "healthy",
        "timestamp": "2026-07-25T17:59:00Z",
        "services": {
            "database": "online",
            "ollama": "online",
            "energyplus": "idle"
        }
    }
