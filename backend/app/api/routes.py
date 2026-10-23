from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any

from app.schemas.prediction import (
    EarlyPostAnalysisRequest,
    PropagationPredictionResponse,
    ModelMetadataResponse
)
from app.ml.predictor import predictor

router = APIRouter()

@router.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "Hate Speech Propagation Prediction API",
        "model_loaded": predictor.is_loaded,
        "mode": predictor.mode,
        "version": "1.0.0"
    }

@router.get("/model-info", response_model=ModelMetadataResponse, tags=["Machine Learning"])
def get_model_information():
    return predictor.get_metadata()

@router.post("/predict", response_model=PropagationPredictionResponse, tags=["Machine Learning"])
def predict_propagation(request: EarlyPostAnalysisRequest):
    try:
        response = predictor.predict(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@router.get("/sample-presets", tags=["Demonstration & Presets"])
def get_sample_presets() -> List[Dict[str, Any]]:
    """
    Returns curated real-world representative presets derived from the DRAGNET benchmark
    to help users quickly test the prediction system without manual feature entry.
    """
    return [
        {
            "id": "severe-escalation",
            "title": "Severe Xenophobic Escalation Cascade",
            "category": "High Risk",
            "description": "A provocative political claim that quickly triggered hostile, aggressive replies within the first 20 minutes.",
            "data": {
                "root_text": "These illegal foreigners are destroying our nation, why is nobody taking direct action against them?!",
                "root_hate_score": 0.72,
                "early_reply_count": 15,
                "early_time_span_mins": 18.0,
                "early_mean_hate": 0.48,
                "early_max_hate": 0.94,
                "early_std_hate": 0.22,
                "early_hate_ratio": 0.46,
                "early_user_diversity": 0.86,
                "observation_cutoff_label": "Early Cutoff (15 replies / 18 min)"
            }
        },
        {
            "id": "subtle-dogwhistle",
            "title": "Subtle Dogwhistle with Escalating Polarization",
            "category": "Borderline / Escalating",
            "description": "Seemingly innocuous phrasing that rapidly attracted polarized groups and hostile reply chains.",
            "data": {
                "root_text": "Certain demographic groups seem to always avoid contributing while taking all the welfare benefits.",
                "root_hate_score": 0.18,
                "early_reply_count": 15,
                "early_time_span_mins": 35.0,
                "early_mean_hate": 0.29,
                "early_max_hate": 0.65,
                "early_std_hate": 0.17,
                "early_hate_ratio": 0.26,
                "early_user_diversity": 0.73,
                "observation_cutoff_label": "Early Cutoff (15 replies / 35 min)"
            }
        },
        {
            "id": "benign-discourse",
            "title": "Benign Civic Policy Discussion",
            "category": "Low Risk / Contained",
            "description": "A factual community policy update that generated civil debate without hostile propagation.",
            "data": {
                "root_text": "New municipal transportation bill scheduled for community debate next Tuesday evening.",
                "root_hate_score": 0.02,
                "early_reply_count": 15,
                "early_time_span_mins": 60.0,
                "early_mean_hate": 0.08,
                "early_max_hate": 0.19,
                "early_std_hate": 0.05,
                "early_hate_ratio": 0.00,
                "early_user_diversity": 0.93,
                "observation_cutoff_label": "Early Cutoff (15 replies / 60 min)"
            }
        }
    ]
