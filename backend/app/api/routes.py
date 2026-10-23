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
            "title": "Severe Xenophobic Escalation",
            "category": "High Risk",
            "platform": "twitter",
            "description": "Provocative political post on X that triggered hostile reply chains.",
            "data": {
                "root_text": "These illegal foreigners are destroying our nation, why is nobody taking direct action against them?!",
                "platform": "twitter",
                "root_hate_score": 0.72,
                "early_reply_count": 15,
                "early_time_span_mins": 18.0,
                "early_mean_hate": 0.48,
                "early_max_hate": 0.94,
                "early_std_hate": 0.22,
                "early_hate_ratio": 0.46,
                "early_user_diversity": 0.86,
                "observation_cutoff_label": "Early Cutoff (15 replies)"
            }
        },
        {
            "id": "subtle-dogwhistle",
            "title": "Subtle Dogwhistle Escalation",
            "category": "Borderline",
            "platform": "reddit",
            "description": "Subtle phrasing on Reddit that attracted polarized, hostile comment branches.",
            "data": {
                "root_text": "Certain demographic groups seem to always avoid contributing while taking all the welfare benefits.",
                "platform": "reddit",
                "root_hate_score": 0.18,
                "early_reply_count": 15,
                "early_time_span_mins": 35.0,
                "early_mean_hate": 0.29,
                "early_max_hate": 0.65,
                "early_std_hate": 0.17,
                "early_hate_ratio": 0.26,
                "early_user_diversity": 0.73,
                "observation_cutoff_label": "Early Cutoff (15 replies)"
            }
        },
        {
            "id": "benign-discourse",
            "title": "Benign Civic Policy Discussion",
            "category": "Low Risk",
            "platform": "youtube",
            "description": "Factual community update on YouTube that generated civil discussion.",
            "data": {
                "root_text": "New municipal transportation bill scheduled for community debate next Tuesday evening.",
                "platform": "youtube",
                "root_hate_score": 0.02,
                "early_reply_count": 15,
                "early_time_span_mins": 60.0,
                "early_mean_hate": 0.08,
                "early_max_hate": 0.19,
                "early_std_hate": 0.05,
                "early_hate_ratio": 0.00,
                "early_user_diversity": 0.93,
                "observation_cutoff_label": "Early Cutoff (15 replies)"
            }
        }
    ]
