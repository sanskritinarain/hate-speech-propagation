from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EarlyPostAnalysisRequest(BaseModel):
    root_text: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Text content of the initial root post or tweet being analyzed",
        examples=["This controversial statement is causing widespread debate on community policies."]
    )
    root_hate_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Optional pre-scored hate/toxicity intensity of the root post (0.0 to 1.0). If omitted, an estimate is computed."
    )
    early_reply_count: int = Field(
        default=15,
        ge=1,
        le=100,
        description="Number of early replies observed in the cutoff window (typically 5 to 20)"
    )
    early_time_span_mins: float = Field(
        default=25.0,
        ge=0.5,
        le=1440.0,
        description="Time span in minutes across the early observed replies"
    )
    early_reply_velocity: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=500.0,
        description="Replies per minute during early window. If null, computed as early_reply_count / early_time_span_mins"
    )
    early_mean_hate: float = Field(
        default=0.22,
        ge=0.0,
        le=1.0,
        description="Mean toxicity score across observed early replies (0.0 to 1.0)"
    )
    early_max_hate: float = Field(
        default=0.55,
        ge=0.0,
        le=1.0,
        description="Maximum toxicity score observed in any early reply"
    )
    early_std_hate: float = Field(
        default=0.15,
        ge=0.0,
        le=1.0,
        description="Standard deviation of hate score in early replies"
    )
    early_hate_ratio: float = Field(
        default=0.20,
        ge=0.0,
        le=1.0,
        description="Proportion of early replies exceeding toxicity threshold (0.0 to 1.0)"
    )
    early_user_diversity: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="Ratio of unique authors to total early replies (measures astroturfing vs broad engagement)"
    )
    observation_cutoff_label: str = Field(
        default="Early Window (Cutoff = 15 replies / 25 min)",
        description="Human-readable label for the temporal observation horizon"
    )

class ContributingFactor(BaseModel):
    feature: str
    label: str
    impact: str  # "high_risk", "moderate_risk", "low_risk"
    description: str

class TimelinePoint(BaseModel):
    time_marker: str
    observed_or_projected: str  # "observed" or "projected"
    cumulative_replies: int
    estimated_toxicity_mean: float

class PropagationPredictionResponse(BaseModel):
    mode: str = Field(description="'real_model_inference' or 'synthetic_demo_mode'")
    model_source: str
    dataset_provenance: str
    escalation_risk: str = Field(description="'HIGH' | 'MODERATE' | 'LOW'")
    escalation_probability: float = Field(description="Probability of severe future hate propagation (0.0 to 1.0)")
    predicted_future_reply_volume: int = Field(description="Estimated number of replies that will accumulate after cutoff")
    estimated_total_cascade_size: int = Field(description="Early replies + predicted future reply volume")
    cascade_reach_tier: str = Field(description="'Viral / Extensive (>200)' | 'Moderate' | 'Contained'")
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
    feature_importances: List[Dict[str, Any]]
