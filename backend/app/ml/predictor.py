import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from app.core.config import settings
from app.schemas.prediction import (
    EarlyPostAnalysisRequest,
    PropagationPredictionResponse,
    ContributingFactor,
    TimelinePoint,
    ModelMetadataResponse
)
from app.ml.preprocessor import prepare_inference_features

PLATFORM_METADATA = {
    "twitter": {
        "label": "X (Twitter)",
        "context": "Microblogging broadcast network: Propagation driven by retweets, quotes, and rapid algorithmic velocity."
    },
    "reddit": {
        "label": "Reddit",
        "context": "Community thread topology: Escalation occurs within nested comment branches and upvote-driven visibility."
    },
    "youtube": {
        "label": "YouTube",
        "context": "Video comment sections: Propagation clusters around top/pinned comments and polarized reply chains."
    },
    "instagram": {
        "label": "Instagram",
        "context": "Visual feed commentary: Spikes occur when controversial post tags trigger influencer or community brigading."
    },
    "facebook": {
        "label": "Facebook",
        "context": "Social graph groups: Propagation spreads through shares across interconnected peer networks."
    },
    "other": {
        "label": "Web Discussion Thread",
        "context": "Generic forum topology: Chronological replies and author reply-chains."
    }
}

class HatePropagationPredictor:
    def __init__(self):
        self.classifier = None
        self.regressor = None
        self.metrics = {}
        self.is_loaded = False
        self.mode = "uninitialized"
        self.load_models()

    def load_models(self):
        try:
            if os.path.exists(settings.CLASSIFIER_PATH) and os.path.exists(settings.REGRESSOR_PATH):
                self.classifier = joblib.load(settings.CLASSIFIER_PATH)
                self.regressor = joblib.load(settings.REGRESSOR_PATH)
                self.is_loaded = True
                self.mode = "real_model_inference"
            else:
                self.is_loaded = False
                self.mode = "synthetic_demo_mode"
        except Exception as e:
            print(f"Error loading models: {e}. Falling back to demo mode.")
            self.is_loaded = False
            self.mode = "synthetic_demo_mode"

        if os.path.exists(settings.METRICS_PATH):
            try:
                with open(settings.METRICS_PATH, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
            except Exception:
                self.metrics = {}

    def get_metadata(self) -> ModelMetadataResponse:
        if self.metrics and self.is_loaded:
            clf_m = self.metrics.get("classification", {}).get("stronger_hist_gradient_boosting", {})
            reg_m = self.metrics.get("regression", {}).get("stronger_hist_gradient_boosting", {})
            return ModelMetadataResponse(
                status="online",
                mode=self.mode,
                dataset_name=self.metrics.get("dataset_name", "DRAGNET Benchmark"),
                source_repository=self.metrics.get("source_repository", "LCS2-IIITD/Predicting-Hate-Intensity"),
                cutoff_early_replies=self.metrics.get("cutoff_early_replies", 15),
                total_threads_analyzed=self.metrics.get("total_threads_analyzed", 2157),
                split_sizes=self.metrics.get("split_sizes", {}),
                features_used=self.metrics.get("features_used", []),
                classification_metrics=clf_m,
                regression_metrics=reg_m,
                feature_importances=self.metrics.get("feature_importances", [])
            )
        else:
            return ModelMetadataResponse(
                status="demo_mode_only",
                mode="synthetic_demo_mode",
                dataset_name="DRAGNET Benchmark (Demo Mode)",
                source_repository="LCS2-IIITD/Predicting-Hate-Intensity",
                cutoff_early_replies=15,
                total_threads_analyzed=0,
                split_sizes={"train": 0, "validation": 0, "test": 0},
                features_used=[],
                classification_metrics={"f1_score": 0.0, "roc_auc": 0.0},
                regression_metrics={"mae": 0.0, "rmse": 0.0},
                feature_importances=[]
            )

    def predict(self, req: EarlyPostAnalysisRequest) -> PropagationPredictionResponse:
        X = prepare_inference_features(req)
        
        # Platform info
        plat_key = req.platform.lower().strip() if req.platform else "twitter"
        plat_info = PLATFORM_METADATA.get(plat_key, PLATFORM_METADATA["other"])
        
        if self.is_loaded and self.classifier is not None and self.regressor is not None:
            probs = self.classifier.predict_proba(X)[0]
            prob_escalation = float(probs[1]) if len(probs) > 1 else float(probs[0])
            
            raw_future_volume = float(self.regressor.predict(X)[0])
            predicted_future_vol = max(int(round(raw_future_volume)), 0)
            
            mode_label = "real_model_inference"
            provenance = "DRAGNET Research Benchmark (2,157 Conversation Threads, LCS2 IIITD)"
            model_source = "HistGradientBoosting Pipeline (scikit-learn 1.9)"
        else:
            heuristic_prob = (
                (req.early_mean_hate * 0.45) +
                (req.early_hate_ratio * 0.35) +
                (min(req.early_reply_count / 15.0, 1.0) * 0.20)
            )
            prob_escalation = float(np.clip(heuristic_prob, 0.05, 0.95))
            predicted_future_vol = int(round(req.early_reply_count * 10 * prob_escalation))
            mode_label = "synthetic_demo_mode"
            provenance = "Synthetic Demo Mode"
            model_source = "Illustrative Heuristic Demo Mode"

        if prob_escalation >= 0.55:
            risk = "HIGH"
        elif prob_escalation >= 0.35:
            risk = "MODERATE"
        else:
            risk = "LOW"
            
        total_cascade = req.early_reply_count + predicted_future_vol
        
        if total_cascade >= 180:
            reach_tier = "Viral / Extensive (>180)"
        elif total_cascade >= 60:
            reach_tier = "Moderate Cascade (60-180)"
        else:
            reach_tier = "Contained Cascade (<60)"

        lower_bound = max(0, predicted_future_vol - 35)
        upper_bound = predicted_future_vol + 45
        
        # Concise diagnostic factors (clean, low-text)
        factors = []
        if req.early_mean_hate >= 0.30:
            factors.append(ContributingFactor(
                feature="early_mean_hate",
                label="Elevated Early Toxicity",
                impact="high_risk",
                description=f"Early replies average {req.early_mean_hate:.2f} toxicity."
            ))
        else:
            factors.append(ContributingFactor(
                feature="early_mean_hate",
                label="Controlled Early Tone",
                impact="low_risk",
                description=f"Early replies average {req.early_mean_hate:.2f} toxicity."
            ))

        velocity = req.early_reply_count / max(req.early_time_span_mins, 0.1)
        if velocity >= 1.0:
            factors.append(ContributingFactor(
                feature="early_reply_velocity",
                label="High Reply Velocity",
                impact="high_risk",
                description=f"Arriving at {velocity:.1f} replies/min."
            ))
        else:
            factors.append(ContributingFactor(
                feature="early_reply_velocity",
                label="Moderate Velocity",
                impact="low_risk",
                description=f"Arriving at {velocity:.2f} replies/min."
            ))

        if req.early_hate_ratio >= 0.25:
            factors.append(ContributingFactor(
                feature="early_hate_ratio",
                label="High Toxic Ratio",
                impact="high_risk",
                description=f"{req.early_hate_ratio*100:.0f}% of early replies are toxic."
            ))

        if req.early_user_diversity < 0.60:
            factors.append(ContributingFactor(
                feature="early_user_diversity",
                label="Low Author Diversity",
                impact="moderate_risk",
                description="Activity concentrated among few repeat accounts."
            ))
        else:
            factors.append(ContributingFactor(
                feature="early_user_diversity",
                label="Diverse Participant Base",
                impact="low_risk",
                description="Organic distribution across independent users."
            ))

        early_time = req.early_time_span_mins
        timeline = [
            TimelinePoint(
                time_marker="T=0m",
                observed_or_projected="observed",
                cumulative_replies=1,
                estimated_toxicity_mean=round(float(X["root_hate_score"].iloc[0]), 3)
            ),
            TimelinePoint(
                time_marker=f"T={int(early_time/2)}m",
                observed_or_projected="observed",
                cumulative_replies=max(1, int(req.early_reply_count / 2)),
                estimated_toxicity_mean=round(float(req.early_mean_hate * 0.9), 3)
            ),
            TimelinePoint(
                time_marker=f"T={int(early_time)}m (Cutoff)",
                observed_or_projected="observed",
                cumulative_replies=req.early_reply_count,
                estimated_toxicity_mean=round(float(req.early_mean_hate), 3)
            ),
            TimelinePoint(
                time_marker=f"T={int(early_time + 45)}m",
                observed_or_projected="projected",
                cumulative_replies=int(req.early_reply_count + (predicted_future_vol * 0.35)),
                estimated_toxicity_mean=round(float(min(req.early_mean_hate * (1.1 if risk == 'HIGH' else 0.85), 0.95)), 3)
            ),
            TimelinePoint(
                time_marker=f"T={int(early_time + 120)}m",
                observed_or_projected="projected",
                cumulative_replies=int(req.early_reply_count + (predicted_future_vol * 0.75)),
                estimated_toxicity_mean=round(float(min(req.early_mean_hate * (1.2 if risk == 'HIGH' else 0.75), 0.95)), 3)
            ),
            TimelinePoint(
                time_marker=f"T={int(early_time + 240)}m",
                observed_or_projected="projected",
                cumulative_replies=total_cascade,
                estimated_toxicity_mean=round(float(min(req.early_mean_hate * (1.25 if risk == 'HIGH' else 0.70), 0.95)), 3)
            )
        ]

        caveat = (
            "Responsible Use: Statistical forecast based on early activity. For moderation support only, not autonomous censorship."
        )

        return PropagationPredictionResponse(
            mode=mode_label,
            platform=plat_key,
            platform_label=plat_info["label"],
            platform_context=plat_info["context"],
            model_source=model_source,
            dataset_provenance=provenance,
            escalation_risk=risk,
            escalation_probability=round(prob_escalation, 4),
            predicted_future_reply_volume=predicted_future_vol,
            estimated_total_cascade_size=total_cascade,
            cascade_reach_tier=reach_tier,
            confidence_interval={"lower_bound": lower_bound, "upper_bound": upper_bound},
            contributing_factors=factors,
            timeline_projection=timeline,
            caveats_and_responsible_use=caveat
        )

predictor = HatePropagationPredictor()
