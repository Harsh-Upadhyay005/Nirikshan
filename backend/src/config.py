from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    database_url: str = "postgresql://nirikshan_user:localdev123@localhost:5432/nirikshan"
    
    jwt_secret: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_days: int = 7
    
    ml_models_path: str = "../ml/models"
    
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Email Settings
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "Nirikshan Alerts <noreply@nirikshan.gov.in>"
    frontend_url: str = "http://localhost:3000"
    
    env: str = "development"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    @property
    def models_dir(self) -> Path:
        base_path = Path(__file__).resolve().parent.parent
        return (base_path / self.ml_models_path).resolve()


settings = Settings()
