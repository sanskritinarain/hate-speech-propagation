export interface ObservedComment {
  comment_id: string;
  author?: string;
  text: string;
  created_at?: string;
  like_count?: number;
  parent_id?: string;
  is_root?: boolean;
}

export interface SourceRetrievalResult {
  status: "SUCCESS" | "METADATA_ONLY" | "CREDENTIALS_REQUIRED" | "UNSUPPORTED_PLATFORM" | "POST_NOT_FOUND" | "RATE_LIMITED" | "ERROR";
  platform: string;
  platform_label: string;
  post_id?: string;
  canonical_url: string;
  retrieval_timestamp: string;
  provenance: string;
  title?: string;
  text?: string;
  author?: string;
  published_at?: string;
  metrics: Record<string, any>;
  observed_comments: ObservedComment[];
  missing_fields: string[];
  has_sufficient_cascade_data: boolean;
  observation_window_mins?: number;
  credentials_configured: boolean;
  error_message?: string;
  credentials_help?: string;
}

export interface ContentCategoryScores {
  hate_speech: number;
  offensive_language: number;
  neither: number;
}

export interface ContentAnalysisResponse {
  status: "CLASSIFIED" | "MODEL_UNAVAILABLE";
  primary_category: "hate_speech" | "offensive_language" | "neither";
  category_label: string;
  severity: "HIGH" | "MODERATE" | "LOW";
  category_scores: ContentCategoryScores;
  hate_intensity_score: number;
  model_provenance: string;
  evaluation_benchmark: string;
  limitations: string;
}

export interface PropagationSignalFactor {
  feature: string;
  label: string;
  impact: "high_risk" | "moderate_risk" | "low_risk";
  description: string;
}

export interface PropagationPredictionResult {
  status: "AVAILABLE" | "UNAVAILABLE";
  unavailability_reason?: string;
  observation_window_cutoff: string;
  observed_replies_analyzed: number;
  observed_time_span_mins?: number;
  observed_mean_hate?: number;
  observed_toxic_ratio?: number;
  observed_user_diversity?: number;
  observed_velocity_per_min?: number;

  escalation_risk?: "HIGH" | "MODERATE" | "LOW";
  escalation_probability?: number;
  predicted_future_reply_volume?: number;
  estimated_total_cascade_size?: number;
  prediction_interval?: {
    lower_bound: number;
    upper_bound: number;
  };
  prediction_interval_method?: string;
  cascade_reach_tier?: string;
  diagnostic_factors: PropagationSignalFactor[];
  model_provenance: string;
  model_limitations: string;
}

export interface PipelineAnalysisResponse {
  source: SourceRetrievalResult;
  content_analysis: ContentAnalysisResponse;
  propagation_forecast: PropagationPredictionResult;
  provenance_summary: string;
  execution_timestamp: string;
}

export interface BenchmarkThreadItem {
  thread_id: string;
  root_text: string;
  platform: string;
  early_reply_count: number;
  early_time_span_mins: number;
  early_mean_hate: number;
  early_hate_ratio: number;
  target_high_escalation: number;
  target_future_volume: number;
  category_label: string;
}

export interface CredentialsStatusResponse {
  status: string;
  platforms: {
    youtube: boolean;
    reddit: boolean;
    twitter: boolean;
  };
  instructions: {
    youtube: string;
    reddit: string;
    twitter: string;
  };
}

// Legacy Compatibility Types
export interface EarlyPostAnalysisRequest {
  root_text: string;
  platform?: string;
  root_hate_score?: number;
  early_reply_count: number;
  early_time_span_mins: number;
  early_reply_velocity?: number;
  early_mean_hate: number;
  early_max_hate: number;
  early_std_hate: number;
  early_hate_ratio: number;
  early_user_diversity: number;
  observation_cutoff_label?: string;
}

export interface ContributingFactor {
  feature: string;
  label: string;
  impact: "high_risk" | "moderate_risk" | "low_risk";
  description: string;
}

export interface TimelinePoint {
  time_marker: string;
  observed_or_projected: "observed" | "projected";
  cumulative_replies: number;
  estimated_toxicity_mean: number;
}

export interface PropagationPredictionResponse {
  mode: "real_model_inference" | "synthetic_demo_mode";
  platform: string;
  platform_label: string;
  platform_context: string;
  model_source: string;
  dataset_provenance: string;
  escalation_risk: "HIGH" | "MODERATE" | "LOW";
  escalation_probability: number;
  predicted_future_reply_volume: number;
  estimated_total_cascade_size: number;
  cascade_reach_tier: string;
  confidence_interval: {
    lower_bound: number;
    upper_bound: number;
  };
  contributing_factors: ContributingFactor[];
  timeline_projection: TimelinePoint[];
  caveats_and_responsible_use: string;
}

export interface ModelMetadataResponse {
  status: string;
  mode: string;
  dataset_name: string;
  source_repository: string;
  cutoff_early_replies: number;
  total_threads_analyzed: number;
  split_sizes: {
    train: number;
    validation: number;
    test: number;
  };
  features_used: string[];
  classification_metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    roc_auc?: number;
    pr_auc?: number;
    confusion_matrix?: number[][];
  };
  regression_metrics: {
    mae?: number;
    rmse?: number;
    r2?: number;
  };
  content_metrics?: Record<string, any>;
  feature_importances: Array<{
    feature: string;
    importance: number;
    direction: "positive" | "negative";
  }>;
}

export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  platform?: string;
  description: string;
  data: EarlyPostAnalysisRequest;
}
