from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # MongoDB
    mongo_url: str = "mongodb://localhost:27017/alquran_app"
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_jwt_secret: str
    
    # GLM-4.6 AI
    glm_api_key: str
    
    # Quran API
    quran_api_base_url: str = "https://api.alquran.cloud/v1"
    
    # App
    app_name: str = "Al-Quran AI"
    api_version: str = "v1"
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()