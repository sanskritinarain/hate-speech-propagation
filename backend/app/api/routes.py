import os
import pandas as pd
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.adapters.manager import source_manager
from app.ml.content_analyzer import content_analyzer
from app.ml.propagation_predictor import propagation_predictor
from app.schemas.prediction import (
    SourceAnalysisRequest,
    PipelineAnalysisResponse,
    EarlyPostAnalysisRequest,
    PropagationPredictionResponse,
    ModelMetadataResponse,
    BenchmarkThreadItem,
    ContributingFactor,
    TimelinePoint
)

router = APIRouter()

@router.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "Hate Speech Propagation Prediction & Content Analysis API",
        "model_loaded": propagation_predictor.is_loaded and content_analyzer.is_loaded,
        "mode": "real_model_inference" if propagation_predictor.is_loaded else "uninitialized",
        "content_model_loaded": content_analyzer.is_loaded,
        "propagation_model_loaded": propagation_predictor.is_loaded,
        "credentials_configured": source_manager.get_credentials_status(),
        "version": "2.0.0"
    }

@router.get("/sample-presets", tags=["Demonstration & Presets"])
def get_sample_presets() -> List[Dict[str, Any]]:
    return [
        {
            "id": "severe-xenophobia",
            "title": "Severe Xenophobic Escalation (DRAGNET #1000)",
            "category": "High Risk",
            "platform": "twitter",
            "description": "Historical thread on X triggering hostile, viral reply cascade.",
            "data": {
                "root_text": "These illegal foreigners are destroying our nation, why is nobody taking direct action against them?!",
                "platform": "twitter",
                "early_reply_count": 15,
                "early_time_span_mins": 8.1,
                "early_mean_hate": 0.48,
                "early_max_hate": 0.94,
                "early_std_hate": 0.22,
                "early_hate_ratio": 0.46,
                "early_user_diversity": 0.86
            }
        },
        {
            "id": "dogwhistle-polarization",
            "title": "Dogwhistle Polarization (DRAGNET #1003)",
            "category": "Borderline Escalation",
            "platform": "reddit",
            "description": "Subtle demographic grievance triggering polarized, heated branches.",
            "data": {
                "root_text": "Certain demographic groups seem to always avoid contributing while taking all the welfare benefits.",
                "platform": "reddit",
                "early_reply_count": 15,
                "early_time_span_mins": 35.0,
                "early_mean_hate": 0.27,
                "early_max_hate": 0.55,
                "early_std_hate": 0.18,
                "early_hate_ratio": 0.33,
                "early_user_diversity": 0.86
            }
        },
        {
            "id": "benign-policy",
            "title": "Benign Civic Policy Announcement",
            "category": "Low Risk",
            "platform": "youtube",
            "description": "Civic infrastructure debate with civil discussion and low toxicity.",
            "data": {
                "root_text": "New municipal transportation bill scheduled for community debate next Tuesday evening.",
                "platform": "youtube",
                "early_reply_count": 15,
                "early_time_span_mins": 60.0,
                "early_mean_hate": 0.05,
                "early_max_hate": 0.12,
                "early_std_hate": 0.03,
                "early_hate_ratio": 0.0,
                "early_user_diversity": 0.95
            }
        }
    ]

@router.get("/credentials-status", tags=["System"])
def get_credentials_status():
    return {
        "status": "ok",
        "platforms": source_manager.get_credentials_status(),
        "instructions": {
            "youtube": "Set YOUTUBE_API_KEY in backend/.env to fetch live comment cascades.",
            "reddit": "Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in backend/.env for authorized Reddit API access.",
            "twitter": "Set X_BEARER_TOKEN in backend/.env to access X API v2."
        }
    }

@router.post("/analyze", response_model=PipelineAnalysisResponse, tags=["Evidence Pipeline"])
def analyze_source_pipeline(request: SourceAnalysisRequest):
    """
    Primary evidence-based pipeline:
    1. Validates and retrieves source metadata & comments via platform adapters.
    2. Performs text content analysis (Hate Speech vs Offensive vs Neither).
    3. Forecasts future propagation only if sufficient early cascade data exists.
    """
    now = datetime.now(timezone.utc)

    # 1. Source retrieval
    source_result = source_manager.resolve_source(request.input_source)

    # Determine text to analyze
    target_text = source_result.text or source_result.title or request.input_source

    # 2. Content analysis
    content_result = content_analyzer.analyze(target_text)

    # 3. Propagation forecast
    manual_cascade_dict = request.user_supplied_cascade.model_dump() if request.user_supplied_cascade else None
    forecast_result = propagation_predictor.predict(
        root_text=target_text,
        root_hate_score=content_result.hate_intensity_score,
        comments=source_result.observed_comments,
        manual_override_features=manual_cascade_dict
    )

    provenance = (
        f"Source: {source_result.provenance} | "
        f"Content Model: Davidson et al. (ICWSM 2017) | "
        f"Propagation: {forecast_result.model_provenance if forecast_result.status == 'AVAILABLE' else 'Unavailable'}"
    )

    return PipelineAnalysisResponse(
        source=source_result,
        content_analysis=content_result,
        propagation_forecast=forecast_result,
        provenance_summary=provenance,
        execution_timestamp=now
    )

@router.get("/benchmark-cascades", response_model=List[BenchmarkThreadItem], tags=["Benchmark Dataset"])
def get_benchmark_cascades() -> List[BenchmarkThreadItem]:
    """
    Returns authentic historical conversation threads from the DRAGNET benchmark dataset
    for testing propagation forecasts with real ground truth outcomes.
    """
    sample_path = settings.SAMPLE_DATA_PATH
    if not os.path.exists(sample_path):
        return []

    try:
        df = pd.read_csv(sample_path).head(15)
        items: List[BenchmarkThreadItem] = []
        for _, row in df.iterrows():
            tid = str(row.get("thread_id", ""))
            root_hate = float(row.get("root_hate_score", 0.0))
            is_high = int(row.get("target_high_escalation", 0)) == 1
            future_vol = int(row.get("target_future_volume", 0))

            category = "High Escalation Cascade" if is_high else "Contained / Non-Escalating"

            items.append(BenchmarkThreadItem(
                thread_id=tid,
                root_text=f"Historical DRAGNET Conversation Thread #{tid} (Root Hate Intensity: {root_hate:.2f})",
                platform="twitter",
                early_reply_count=int(row.get("early_reply_count", 15)),
                early_time_span_mins=round(float(row.get("early_time_span_mins", 20.0)), 1),
                early_mean_hate=round(float(row.get("early_mean_hate", 0.2)), 3),
                early_hate_ratio=round(float(row.get("early_hate_ratio", 0.1)), 3),
                target_high_escalation=int(row.get("target_high_escalation", 0)),
                target_future_volume=future_vol,
                category_label=category
            ))
        return items
    except Exception as e:
        print(f"Error loading benchmark cascades: {e}")
        return []

@router.get("/model-info", response_model=ModelMetadataResponse, tags=["Machine Learning"])
def get_model_information():
    clf_m = propagation_predictor.metrics.get("classification", {}).get("stronger_hist_gradient_boosting", {})
    reg_m = propagation_predictor.metrics.get("regression", {}).get("stronger_hist_gradient_boosting", {})

    return ModelMetadataResponse(
        status="online" if propagation_predictor.is_loaded else "offline",
        mode="real_model_inference" if propagation_predictor.is_loaded else "uninitialized",
        dataset_name=propagation_predictor.metrics.get("dataset_name", "DRAGNET Benchmark"),
        source_repository=propagation_predictor.metrics.get("source_repository", "LCS2-IIITD/Predicting-Hate-Intensity"),
        cutoff_early_replies=propagation_predictor.metrics.get("cutoff_early_replies", 15),
        total_threads_analyzed=propagation_predictor.metrics.get("total_threads_analyzed", 2157),
        split_sizes=propagation_predictor.metrics.get("split_sizes", {}),
        features_used=propagation_predictor.metrics.get("features_used", []),
        classification_metrics=clf_m,
        regression_metrics=reg_m,
        content_metrics=content_analyzer.metrics,
        feature_importances=propagation_predictor.metrics.get("feature_importances", [])
    )

@router.post("/predict", response_model=PropagationPredictionResponse, tags=["Machine Learning"])
def legacy_predict(request: EarlyPostAnalysisRequest):
    """
    Backwards-compatible endpoint for existing test suites and integrations,
    running through the real models with empirical error bounds.
    """
    # 1. Content analysis
    content_res = content_analyzer.analyze(request.root_text)
    root_hate = request.root_hate_score if request.root_hate_score is not None else content_res.hate_intensity_score

    # 2. Propagation prediction with empirical error bounds
    manual_features = {
        "early_reply_count": request.early_reply_count,
        "early_time_span_mins": request.early_time_span_mins,
        "early_reply_velocity": request.early_reply_velocity,
        "early_mean_hate": request.early_mean_hate,
        "early_max_hate": request.early_max_hate,
        "early_std_hate": request.early_std_hate,
        "early_hate_ratio": request.early_hate_ratio,
        "early_user_diversity": request.early_user_diversity,
    }

    pred_res = propagation_predictor.predict(
        root_text=request.root_text,
        root_hate_score=root_hate,
        comments=[],
        manual_override_features=manual_features
    )

    if pred_res.status == "AVAILABLE":
        vol = pred_res.predicted_future_reply_volume or 0
        prob = pred_res.escalation_probability or 0.5
        risk = pred_res.escalation_risk or "MODERATE"
        ci = pred_res.prediction_interval or {"lower_bound": max(0, vol - 54), "upper_bound": vol + 54}
        reach_tier = pred_res.cascade_reach_tier or "Contained Cascade"
        factors = [
            ContributingFactor(feature=f.feature, label=f.label, impact=f.impact, description=f.description)
            for f in pred_res.diagnostic_factors
        ]
    else:
        vol = 0
        prob = 0.1
        risk = "LOW"
        ci = {"lower_bound": 0, "upper_bound": 0}
        reach_tier = "Forecast Unavailable"
        factors = []

    total_cascade = request.early_reply_count + vol
    early_time = request.early_time_span_mins

    timeline = [
        TimelinePoint(time_marker="T=0m", observed_or_projected="observed", cumulative_replies=1, estimated_toxicity_mean=round(root_hate, 3)),
        TimelinePoint(time_marker=f"T={int(early_time/2)}m", observed_or_projected="observed", cumulative_replies=max(1, int(request.early_reply_count / 2)), estimated_toxicity_mean=round(request.early_mean_hate * 0.9, 3)),
        TimelinePoint(time_marker=f"T={int(early_time)}m (Cutoff)", observed_or_projected="observed", cumulative_replies=request.early_reply_count, estimated_toxicity_mean=round(request.early_mean_hate, 3)),
        TimelinePoint(time_marker=f"T={int(early_time + 45)}m", observed_or_projected="projected", cumulative_replies=int(request.early_reply_count + (vol * 0.35)), estimated_toxicity_mean=round(request.early_mean_hate, 3)),
        TimelinePoint(time_marker=f"T={int(early_time + 120)}m", observed_or_projected="projected", cumulative_replies=int(request.early_reply_count + (vol * 0.75)), estimated_toxicity_mean=round(request.early_mean_hate, 3)),
        TimelinePoint(time_marker=f"T={int(early_time + 240)}m", observed_or_projected="projected", cumulative_replies=total_cascade, estimated_toxicity_mean=round(request.early_mean_hate, 3))
    ]

    return PropagationPredictionResponse(
        mode="real_model_inference" if propagation_predictor.is_loaded else "synthetic_demo_mode",
        platform=request.platform or "twitter",
        platform_label=request.platform.capitalize() if request.platform else "Platform",
        platform_context="Observed reply dynamics evaluated against historical cascade topologies.",
        model_source="HistGradientBoosting Pipeline (scikit-learn 1.9)",
        dataset_provenance="DRAGNET Research Benchmark (LCS2 IIITD)",
        escalation_risk=risk,
        escalation_probability=round(prob, 4),
        predicted_future_reply_volume=vol,
        estimated_total_cascade_size=total_cascade,
        cascade_reach_tier=reach_tier,
        confidence_interval=ci,
        contributing_factors=factors,
        timeline_projection=timeline,
        caveats_and_responsible_use="Empirical model forecast for moderation triage support. Not autonomous censorship."
    )
