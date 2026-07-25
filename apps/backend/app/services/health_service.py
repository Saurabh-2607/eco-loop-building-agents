from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from loguru import logger
import redis.asyncio as aioredis
import httpx

class HealthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_system_health(self) -> dict:
        """
        Check database, redis, ollama and return system stats status.
        """
        db_healthy = True
        try:
            await self.session.execute(select(1))
        except Exception as e:
            logger.error(f"Database validation check failed: {e}")
            db_healthy = False

        redis_healthy = False
        try:
            r = aioredis.from_url(settings.REDIS_URL, socket_timeout=1.0)
            if await r.ping():
                redis_healthy = True
            await r.close()
        except Exception:
            pass

        ollama_healthy = False
        try:
            async with httpx.AsyncClient(timeout=1.0) as client:
                res = await client.get(f"{settings.OLLAMA_HOST}/")
                if res.status_code == 200:
                    ollama_healthy = True
        except Exception:
            pass

        return {
            "status": "healthy" if db_healthy else "degraded",
            "database": "connected" if db_healthy else "disconnected",
            "redis": "connected" if redis_healthy else "disconnected",
            "ollama": "connected" if ollama_healthy else "disconnected",
            "api": "running",
            "version": "1.0.0"
        }
