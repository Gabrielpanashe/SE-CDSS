const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface FeedbackRequest {
  review: string;
  patient_id?: string;
  drug_name?: string;
  condition?: string;
}

export interface FeedbackResponse {
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  risk_level: string;
  probabilities: { positive: number; neutral: number; negative: number };
  log_id: number;
  disclaimer: string;
  explanation: string | null;
}

export interface RecommendationItem {
  drug: string;
  guideline_score: number;
  ehr_score: number;
  sentiment_score: number;
  recommendation_score: number;
}

export interface RecommendResponse {
  condition: string;
  patient_id: string;
  recommendations: RecommendationItem[];
  disclaimer: string;
  explanation: string | null;
}

export interface TrendEntry {
  log_id: number;
  sentiment: string;
  confidence: number;
  risk_level: string;
  drug_name: string | null;
  timestamp: string;
}

export interface TrendsResponse {
  patient_id: string;
  total_entries: number;
  trends: TrendEntry[];
  disclaimer: string;
  explanation: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  submitFeedback: (body: FeedbackRequest) =>
    request<FeedbackResponse>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getRecommendations: (condition: string, patientId: string, sentiment: string) =>
    request<RecommendResponse>(
      `/api/recommend?condition=${encodeURIComponent(condition)}&patient_id=${encodeURIComponent(patientId)}&sentiment=${encodeURIComponent(sentiment)}`
    ),

  getTrends: (patientId: string) =>
    request<TrendsResponse>(`/api/trends/${encodeURIComponent(patientId)}`),

  health: () => request<{ status: string }>("/health"),
};
