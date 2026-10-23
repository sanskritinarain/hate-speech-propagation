import { 
  EarlyPostAnalysisRequest, 
  PropagationPredictionResponse, 
  ModelMetadataResponse,
  SamplePreset 
} from "@/types/prediction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export async function fetchHealth(): Promise<{ status: string; model_loaded: boolean; mode: string }> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Health check failed: HTTP ${res.status}`);
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
    } catch {
      // fallback
    }
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
