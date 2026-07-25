from fastapi import APIRouter
from app.schemas.responses import StandardSuccessResponse

router = APIRouter()

@router.get("", response_model=StandardSuccessResponse)
async def get_health():
    health_data = {
        "status": "healthy",
        "database": "connected",
        "api": "running",
        "version": "1.0.0"
    }
    return StandardSuccessResponse(
        success=True,
        data=health_data,
        message="Health status retrieved successfully"
    )
