from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parents[4]

class Settings(BaseSettings):
    # Application Parameters
    APP_NAME: str = "EcoLoop API"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me"
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ecoloop"
    
    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379"
    
    # AI / Ollama Settings
    OLLAMA_HOST: str = "http://ollama:11434"
    MODEL_NAME: str = "qwen3:8b"
    
    # EnergyPlus Simulation Settings
    ENERGYPLUS_ROOT: str = "/usr/local/EnergyPlus-26-1-0"
    ENERGYPLUS_BINARY: str = "/usr/local/bin/energyplus"

    ENERGYPLUS_IDF_DIR: str = "/opt/ecoloop/idf"
    ENERGYPLUS_WEATHER_DIR: str = "/opt/ecoloop/weather"
    ENERGYPLUS_OUTPUT_DIR: str = "/opt/ecoloop/output"
    ENERGYPLUS_LOG_DIR: str = "/opt/ecoloop/logs"
    
    # WebSocket Parameters
    WS_HEARTBEAT_INTERVAL_SEC: int = 20
    
    # Logging Configurations
    LOG_LEVEL: str = "INFO"
    LOG_FILE_PATH: str = "logs/backend.log"
    LOG_ROTATION: str = "10 MB"
    LOG_RETENTION: str = "7 days"

    # Priority order load: .env.local -> .env.development -> .env.example
    model_config = SettingsConfigDict(
        env_file=(
            BASE_DIR / ".env.local",
            BASE_DIR / ".env.development",
            BASE_DIR / ".env.production",
            BASE_DIR / ".env.example",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

# Instantiate settings singleton
settings = Settings()
