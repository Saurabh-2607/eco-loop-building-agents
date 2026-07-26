import socket
from loguru import logger
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

def is_postgres_listening(host: str, port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.3)
            s.connect((host, port))
            return True
    except Exception:
        return False

# Force postgresql+asyncpg connection protocol for async runtime
db_url = settings.DATABASE_URL

import os
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sqlite_path = os.path.join(backend_dir, "local_e2e.db")

# Fallback to local SQLite if PostgreSQL port is closed on localhost
if "localhost" in db_url or "127.0.0.1" in db_url:
    if not is_postgres_listening("127.0.0.1", 5432):
        logger.warning(f"PostgreSQL port 5432 is closed on localhost. Falling back to local SQLite database ({sqlite_path}).")
        db_url = f"sqlite+aiosqlite:///{sqlite_path}"

if not db_url:
    db_url = f"sqlite+aiosqlite:///{sqlite_path}"
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
    )

# Remove sslmode from URL since asyncpg doesn't understand it
db_url = db_url.replace("?sslmode=require", "")

engine_args = {
    "future": True
}
if "sqlite" not in db_url:
    engine_args.update({
        "connect_args": {"ssl": "require"},
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20
    })

logger.info(f"Database: Initializing async engine with URL: {db_url}")

engine = create_async_engine(
    db_url,
    **engine_args
)