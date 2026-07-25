from fastapi import APIRouter

router = APIRouter()

@router.post("")
async def post_optimize():
    return {
        "decision_id": "a90b4dcb-2c40-410a-8bfb-88a3b5a19020",
        "timestamp": "2026-07-25T17:59:10Z",
        "applied_settings": {
          "hvac": 22.0,
          "lighting": 75
        },
        "reason": "Occupancy is below threshold.",
        "model_performance": {
          "model": "qwen3-7b-instruct",
          "tokens_consumed": 450,
          "latency_seconds": 3.4
        }
    }
