from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import List


class Settings(BaseSettings):
    database_url: str
    
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiry_days: int = 7
    
    ml_models_path: str = "../ml/models"
    
    cors_origins: List[str]
    
    # Google OAuth
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str | None = None
    
    # Brevo (SendinBlue) Email Settings
    brevo_api_key: str | None = None
    brevo_sender_email: str = "noreply@nirikshan.gov.in"
    brevo_sender_name: str = "Nirikshan Alerts"
    
    frontend_url: str
    env: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    @property
    def models_dir(self) -> Path:
        base_path = Path(__file__).resolve().parent.parent
        return (base_path / self.ml_models_path).resolve()
    
    def validate_production_config(self):
        """Validate critical configuration for production deployment."""
        if self.env == "production":
            if len(self.jwt_secret) < 32:
                raise ValueError("JWT_SECRET must be at least 32 characters in production")
            if "localhost" in self.database_url:
                raise ValueError("Cannot use localhost database in production")
            if any("localhost" in origin for origin in self.cors_origins):
                raise ValueError("Cannot use localhost in CORS_ORIGINS for production")
        
        if not self.jwt_secret:
            raise ValueError("JWT_SECRET is required")
        if not self.database_url:
            raise ValueError("DATABASE_URL is required")
        if not self.cors_origins:
            raise ValueError("CORS_ORIGINS is required")


settings = Settings()
