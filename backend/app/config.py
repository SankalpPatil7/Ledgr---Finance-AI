import os
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Locate .env file in backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()

class Settings:
    def __init__(self):
        self.nvidia_base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1").strip()
        self.nvidia_model = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-ultra-550b-a55b").strip()
        self.request_timeout = float(os.getenv("NVIDIA_TIMEOUT", "30.0"))
        self.max_retries = int(os.getenv("NVIDIA_MAX_RETRIES", "3"))

    def get_api_key(self) -> str:
        return os.getenv("NVIDIA_API_KEY", "").strip()

    def get_model(self) -> str:
        return os.getenv("NVIDIA_MODEL", self.nvidia_model).strip()

    def get_base_url(self) -> str:
        return os.getenv("NVIDIA_BASE_URL", self.nvidia_base_url).strip()

    def is_nvidia_configured(self) -> bool:
        key = self.get_api_key()
        return bool(key and len(key) > 5 and not key.startswith("YOUR_"))

    def get_config_status(self) -> Dict[str, Any]:
        """Returns safe configuration status without exposing the API key."""
        return {
            "ai_configured": self.is_nvidia_configured(),
            "model": self.get_model(),
            "base_url": self.get_base_url(),
            "timeout_seconds": self.request_timeout,
            "max_retries": self.max_retries
        }

settings = Settings()
