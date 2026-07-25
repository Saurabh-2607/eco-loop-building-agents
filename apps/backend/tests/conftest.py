import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# Import unified metadata registry to verify database bindings
from app.database.base import metadata

# SQLite memory database coordinates
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="function")
async def db_session():
    """
    Function-scoped session generating memory schemas.
    """
    engine = create_async_engine(DATABASE_URL, future=True)
    
    # Create all schema tables in memory
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)
        
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        yield session
        await session.close()
        
    async with engine.begin() as conn:
        await conn.run_sync(metadata.drop_all)
        
    await engine.dispose()
