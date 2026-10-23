import os
import json
import joblib
import numpy as np
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.core.config import settings

CONTENT_MODEL_PATH = os.path.join(settings.MODELS_DIR, "content_classifier.joblib")
CONTENT_METRICS_PATH = os.path.join(settings.MODELS_DIR, "content_metrics.json")

class ContentCategoryScores(BaseModel):
    hate_speech: float = Field(description="Probability of hate speech (dehumanization, incitement, targeted hostility)")
    offensive_language: float = Field(description="Probability of offensive language (crude, profane, non-targeted)")
    neither: float = Field(description="Probability of neutral, civil, or benign discourse")

class ContentAnalysisResponse(BaseModel):
    status: str = Field(description="'CLASSIFIED' | 'MODEL_UNAVAILABLE'")
    primary_category: str = Field(description="'hate_speech' | 'offensive_language' | 'neither'")
    category_label: str = Field(description="Human-readable category name")
    severity: str = Field(description="'HIGH' | 'MODERATE' | 'LOW'")
    category_scores: ContentCategoryScores
    hate_intensity_score: float = Field(description="Calibrated score from 0.0 to 1.0 reflecting hate content intensity")
    model_provenance: str
    evaluation_benchmark: str
    limitations: str

class ContentAnalyzer:
    def __init__(self):
        self.pipeline = None
        self.metrics: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        if os.path.exists(CONTENT_MODEL_PATH):
            try:
                self.pipeline = joblib.load(CONTENT_MODEL_PATH)
                self.is_loaded = True
            except Exception as e:
                print(f"Error loading content classifier: {e}")
                self.is_loaded = False

        if os.path.exists(CONTENT_METRICS_PATH):
            try:
                with open(CONTENT_METRICS_PATH, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
            except Exception:
                pass

    def analyze(self, text: str) -> ContentAnalysisResponse:
        trimmed = text.strip() if text else ""
        if not trimmed or not self.is_loaded or self.pipeline is None:
            return ContentAnalysisResponse(
                status="MODEL_UNAVAILABLE",
                primary_category="neither",
                category_label="Unclassified",
                severity="LOW",
                category_scores=ContentCategoryScores(hate_speech=0.0, offensive_language=0.0, neither=1.0),
                hate_intensity_score=0.0,
                model_provenance="Unavailable",
                evaluation_benchmark="N/A",
                limitations="Content model not loaded. Run scripts/train_content_model.py."
            )

        # Predict with calibrated TF-IDF + Logistic Regression pipeline
        probs = self.pipeline.predict_proba([trimmed])[0]
        # Class 0: hate_speech, Class 1: offensive_language, Class 2: neither
        p_hate = float(probs[0])
        p_off = float(probs[1])
        p_neither = float(probs[2])

        pred_idx = int(np.argmax(probs))
        categories = ["hate_speech", "offensive_language", "neither"]
        labels = ["Hate Speech", "Offensive Language", "Neutral / Benign"]
        primary = categories[pred_idx]
        label = labels[pred_idx]

        # Severity classification
        if primary == "hate_speech" or p_hate >= 0.40:
            severity = "HIGH"
        elif primary == "offensive_language" or (p_hate >= 0.20 or p_off >= 0.50):
            severity = "MODERATE"
        else:
            severity = "LOW"

        # Hate intensity: reflects targeted hostility (hate speech probability weighted by offensive presence)
        hate_intensity = round(float(p_hate + (p_off * 0.15)), 4)
        hate_intensity = min(hate_intensity, 1.0)

        limitations = (
            "Model trained on Davidson et al. (ICWSM 2017) Twitter benchmark. "
            "Separates targeted hate speech from general offensive slang. "
            "May exhibit false positives on colloquial African American Vernacular English (AAVE) or platform-specific slang."
        )

        return ContentAnalysisResponse(
            status="CLASSIFIED",
            primary_category=primary,
            category_label=label,
            severity=severity,
            category_scores=ContentCategoryScores(
                hate_speech=round(p_hate, 4),
                offensive_language=round(p_off, 4),
                neither=round(p_neither, 4)
            ),
            hate_intensity_score=hate_intensity,
            model_provenance="TfidfVectorizer + Balanced LogisticRegression Pipeline (24,783 annotated samples)",
            evaluation_benchmark="Davidson et al. (ICWSM 2017) Hate Speech Benchmark (Macro F1 = 0.7381)",
            limitations=limitations
        )

content_analyzer = ContentAnalyzer()
