import { 
  EarlyPostAnalysisRequest, 
  PropagationPredictionResponse, 
  ModelMetadataResponse,
  SamplePreset,
  PipelineAnalysisResponse,
  BenchmarkThreadItem,
  CredentialsStatusResponse
} from "@/types/prediction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export async function fetchHealth(): Promise<{
  status: string;
  model_loaded: boolean;
  mode: string;
  content_model_loaded?: boolean;
  propagation_model_loaded?: boolean;
  credentials_configured?: Record<string, boolean>;
}> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Health check failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchCredentialsStatus(): Promise<CredentialsStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/credentials-status`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load credentials status: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchModelMetadata(): Promise<ModelMetadataResponse> {
  const res = await fetch(`${API_BASE_URL}/model-info`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load model metadata: HTTP ${res.status}`);
  }
  return res.json();
}

export async function analyzeSource(
  inputSource: string,
  userSuppliedCascade?: any
): Promise<PipelineAnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input_source: inputSource,
      user_supplied_cascade: userSuppliedCascade || null
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let message = `Analysis failed with HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.detail) {
        message = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
      }
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function fetchBenchmarkCascades(): Promise<BenchmarkThreadItem[]> {
  const res = await fetch(`${API_BASE_URL}/benchmark-cascades`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch benchmark cascades: HTTP ${res.status}`);
  }
  return res.json();
}

export async function predictPropagation(
  payload: EarlyPostAnalysisRequest
): Promise<PropagationPredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let message = `Prediction failed with HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.detail) {
        message = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
      }
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export async function fetchSamplePresets(): Promise<SamplePreset[]> {
  const res = await fetch(`${API_BASE_URL}/sample-presets`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch presets: HTTP ${res.status}`);
  }
  return res.json();
}
