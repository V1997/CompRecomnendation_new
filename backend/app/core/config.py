try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

from typing import List
import os

class Settings(BaseSettings):
    # Basic settings
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/property_valuation"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost:3001", "*"]
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    # ML Configuration
    MODEL_VERSION: str = "1.0.0"
    RETRAIN_THRESHOLD: int = 100
    SIMILARITY_THRESHOLD: float = 0.6
    
    # External APIs
    GOOGLE_MAPS_API_KEY: str = ""
    ZILLOW_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
