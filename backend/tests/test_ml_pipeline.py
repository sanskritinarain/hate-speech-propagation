import pytest
import pandas as pd
from app.schemas.prediction import EarlyPostAnalysisRequest
from app.ml.preprocessor import prepare_inference_features, FEATURE_COLUMNS, estimate_root_toxicity
from app.ml.predictor import predictor

def test_estimate_root_toxicity():
    score_benign = estimate_root_toxicity("Welcome everyone to the annual flower show!")
    score_toxic = estimate_root_toxicity("These violent terrorists and scum must be destroyed immediately.")
    assert score_toxic > score_benign

def test_prepare_inference_features():
    req = EarlyPostAnalysisRequest(
        root_text="Breaking update on controversial legislation.",
        early_reply_count=15,
        early_time_span_mins=30.0,
        early_mean_hate=0.30,
        early_max_hate=0.70,
        early_std_hate=0.15,
        early_hate_ratio=0.25,
        early_user_diversity=0.80
    )
    df = prepare_inference_features(req)
    assert isinstance(df, pd.DataFrame)
    assert list(df.columns) == FEATURE_COLUMNS
    assert len(df) == 1
    assert df["early_reply_count"].iloc[0] == 15
    assert df["early_reply_velocity"].iloc[0] == 0.5  # 15 / 30.0

def test_predictor_direct_inference():
    req = EarlyPostAnalysisRequest(
        root_text="Analysis sample test statement.",
        early_reply_count=15,
        early_time_span_mins=20.0,
        early_mean_hate=0.25,
        early_max_hate=0.60,
        early_std_hate=0.12,
        early_hate_ratio=0.20,
        early_user_diversity=0.85
    )
    res = predictor.predict(req)
    assert res.mode in ["real_model_inference", "synthetic_demo_mode"]
    assert res.predicted_future_reply_volume >= 0
    assert res.confidence_interval["lower_bound"] <= res.confidence_interval["upper_bound"]
