import os
from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hate Speech Propagation Prediction API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://localhost:3000",
        "https://localhost:3001",
    ]
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    CLASSIFIER_PATH: str = os.path.join(MODELS_DIR, "classifier_pipeline.joblib")
    REGRESSOR_PATH: str = os.path.join(MODELS_DIR, "regressor_pipeline.joblib")
    METRICS_PATH: str = os.path.join(MODELS_DIR, "evaluation_metrics.json")
    SAMPLE_DATA_PATH: str = os.path.join(DATA_DIR, "processed_threads_sample.csv")

    model_config = ConfigDict(env_file=".env", extra="allow")

settings = Settings()
