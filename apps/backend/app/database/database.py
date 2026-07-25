from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

# Force postgresql+asyncpg connection protocol for async runtime
db_url = settings.DATABASE_URL
if not db_url:
    db_url = "postgresql+asyncpg://postgres:postgres@localhost:5432/ecoloop"
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Asynchronous SQLAlchemy Engine with Connection Pooling configurations
engine = create_async_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True
)
