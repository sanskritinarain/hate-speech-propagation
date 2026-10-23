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
