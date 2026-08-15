from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/opsn.sqlite"
    clerk_jwks_url: str | None = None
    clerk_issuer: str | None = None
    cors_origins: str = "http://localhost:5173"
    seed_demo_data: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
