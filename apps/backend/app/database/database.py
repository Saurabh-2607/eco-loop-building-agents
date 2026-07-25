from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

# Force postgresql+asyncpg connection protocol for async runtime
db_url = settings.DATABASE_URL

if not db_url:
    db_url = "postgresql+asyncpg://postgres:postgres@localhost:5432/ecoloop"
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
    )

# Remove sslmode from URL since asyncpg doesn't understand it
db_url = db_url.replace("?sslmode=require", "")

engine = create_async_engine(
    db_url,
    connect_args={"ssl": "require"},
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True,
)