from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.adapters.base import SourceRetrievalResult, ObservedComment
from app.ml.content_analyzer import ContentAnalysisResponse
from app.ml.propagation_predictor import PropagationPredictionResult

class UserSuppliedCascadeInput(BaseModel):
    early_reply_count: int = Field(default=15, ge=1, le=100)
    early_time_span_mins: float = Field(default=25.0, ge=0.5, le=1440.0)
    early_reply_velocity: Optional[float] = Field(default=None, ge=0.0, le=500.0)
    early_mean_hate: float = Field(default=0.20, ge=0.0, le=1.0)
    early_max_hate: float = Field(default=0.50, ge=0.0, le=1.0)
    early_std_hate: float = Field(default=0.15, ge=0.0, le=1.0)
    early_hate_ratio: float = Field(default=0.20, ge=0.0, le=1.0)
    early_user_diversity: float = Field(default=0.85, ge=0.0, le=1.0)

class SourceAnalysisRequest(BaseModel):
    input_source: str = Field(
        ...,
        min_length=2,
        max_length=2000,
        description="Supported post URL (YouTube, Reddit, X) or raw post text content"
    )
    user_supplied_cascade: Optional[UserSuppliedCascadeInput] = Field(
        default=None,
        description="Optional manual cascade observations for testing scenarios when live API is unavailable"
    )

class PipelineAnalysisResponse(BaseModel):
    source: SourceRetrievalResult
    content_analysis: ContentAnalysisResponse
    propagation_forecast: PropagationPredictionResult
    provenance_summary: str
    execution_timestamp: datetime

# Legacy Compatibility Schemas
class EarlyPostAnalysisRequest(BaseModel):
    root_text: str = Field(..., min_length=3, max_length=1000)
    platform: Optional[str] = "twitter"
    root_hate_score: Optional[float] = None
    early_reply_count: int = Field(default=15, ge=1, le=100)
    early_time_span_mins: float = Field(default=25.0, ge=0.5, le=1440.0)
    early_reply_velocity: Optional[float] = None
    early_mean_hate: float = Field(default=0.22, ge=0.0, le=1.0)
    early_max_hate: float = Field(default=0.55, ge=0.0, le=1.0)
    early_std_hate: float = Field(default=0.15, ge=0.0, le=1.0)
    early_hate_ratio: float = Field(default=0.20, ge=0.0, le=1.0)
    early_user_diversity: float = Field(default=0.85, ge=0.0, le=1.0)
    observation_cutoff_label: Optional[str] = None

class ContributingFactor(BaseModel):
    feature: str
    label: str
    impact: str
    description: str

class TimelinePoint(BaseModel):
    time_marker: str
    observed_or_projected: str
    cumulative_replies: int
    estimated_toxicity_mean: float

class PropagationPredictionResponse(BaseModel):
    mode: str
    platform: str
    platform_label: str
    platform_context: str
    model_source: str
    dataset_provenance: str
    escalation_risk: str
    escalation_probability: float
    predicted_future_reply_volume: int
    estimated_total_cascade_size: int
    cascade_reach_tier: str
    confidence_interval: Dict[str, int]
    contributing_factors: List[ContributingFactor]
    timeline_projection: List[TimelinePoint]
    caveats_and_responsible_use: str

class ModelMetadataResponse(BaseModel):
    status: str
    mode: str
    dataset_name: str
    source_repository: str
    cutoff_early_replies: int
    total_threads_analyzed: int
    split_sizes: Dict[str, int]
    features_used: List[str]
    classification_metrics: Dict[str, Any]
    regression_metrics: Dict[str, Any]
    content_metrics: Optional[Dict[str, Any]] = None
    feature_importances: List[Dict[str, Any]]

class BenchmarkThreadItem(BaseModel):
    thread_id: str
    root_text: str
    platform: str
    early_reply_count: int
    early_time_span_mins: float
    early_mean_hate: float
    early_hate_ratio: float
    target_high_escalation: int
    target_future_volume: int
    category_label: str
