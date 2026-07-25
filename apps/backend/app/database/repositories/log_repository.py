from sqlalchemy.ext.asyncio import AsyncSession
from app.database.repositories.base_repository import BaseRepository
from app.database.models.logs import DBLog

class LogRepository(BaseRepository[DBLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(DBLog, session)
