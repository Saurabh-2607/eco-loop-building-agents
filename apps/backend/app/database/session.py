from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.database.database import engine

# Thread-safe Async Session factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    """
    FastAPI dependency yielding db sessions.
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
