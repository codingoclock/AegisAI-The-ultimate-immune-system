import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AEGIS_API_BASE_URL ?? "http://localhost:8000",
  timeout: 30_000,
});

export type TopKPrediction = {
  label: string;
  probability: number;
};

export type InferenceResponse = {
  clean_prediction: string;
  adversarial_prediction: string;
  clean_confidence: number;
  adversarial_confidence: number;
  top_k: TopKPrediction[];
  attack_type: string;
  epsilon: number;
};

export type AnomalySummary = {
  window_minutes: number;
  total_events: number;
  anomalies: number;
  critical: number;
};

export type AnomalyFeatures = {
  impossible_travel_speed: number;
  login_frequency_1hr: number;
  ip_change_count_24hr: number;
};

export type AnomalyResponse = {
  is_anomaly: boolean;
  model_score: number;
};

export async function runImageInference(
  file: File,
  attackType: string = "FGSM",
  epsilon: number = 0.03
): Promise<InferenceResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("attack_type", attackType);
  formData.append("epsilon", epsilon.toString());

  const res = await api.post<InferenceResponse>("/inference/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function predictAnomaly(
  features: AnomalyFeatures
): Promise<AnomalyResponse> {
  const res = await api.post<AnomalyResponse>("/predict_anomaly", features);
  return res.data;
}

export async function fetchAnomalySummary(): Promise<AnomalySummary> {
  try {
    const res = await api.get<AnomalySummary>("/anomalies/summary");
    return res.data;
  } catch (error) {
    // Fallback if endpoint doesn't exist yet
    console.warn("Anomaly summary endpoint not available, returning mock data");
    return {
      window_minutes: 60,
      total_events: 847,
      anomalies: 127,
      critical: 12,
    };
  }
}

export async function healthCheck() {
  try {
    const res = await api.get("/health");
    return res.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
}

export { api as aegisApiClient };

