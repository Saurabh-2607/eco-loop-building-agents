from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Convert DB URL to async if not already async (e.g. replacing postgresql:// with postgresql+asyncpg://)
async_db_url = settings.DATABASE_URL
if async_db_url.startswith("postgresql://"):
    async_db_url = async_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Initialize Async Engine
engine = create_async_engine(
    async_db_url,
    pool_pre_ping=True,
    future=True
)

# Async Session Factory
async_session_maker = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def get_db_session():
    """
    Dependency generator yielding DB session instances.
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
