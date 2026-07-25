from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Application Parameters
    APP_NAME: str = "EcoLoop API"
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me"
    
    # Database Settings
    POSTGRES_DB: str = "ecoloop"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/ecoloop"
    
    # AI / Ollama Settings
    OLLAMA_HOST: str = "http://ollama:11434"
    MODEL_NAME: str = "qwen3:8b"
    
    # EnergyPlus Simulation Settings
    ENERGYPLUS_ROOT: str = "/simulation"
    
    # WebSocket Parameters
    WS_HEARTBEAT_INTERVAL_SEC: int = 20
    
    # Logging Configurations
    LOG_LEVEL: str = "INFO"
    LOG_FILE_PATH: str = "logs/backend.log"
    LOG_ROTATION: str = "10 MB"
    LOG_RETENTION: str = "7 days"

    # Settings configurations (enables loading from .env.development or .env files)
    model_config = SettingsConfigDict(
        env_file=".env.development", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

# Instantiate settings singleton
settings = Settings()
