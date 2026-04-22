"use client";

import { useState } from "react";
import { api, FeedbackResponse, RecommendResponse } from "@/lib/api";
import { SentimentResult } from "@/components/SentimentResult";
import { RecommendationTable } from "@/components/RecommendationTable";
import { Spinner } from "@/components/ui/Spinner";
import { CONDITIONS } from "@/lib/utils";
import { Send, RefreshCw, User, Pill, Stethoscope, FileText } from "lucide-react";

interface FormState {
  review: string;
  patient_id: string;
  drug_name: string;
  condition: string;
}

const EXAMPLE_REVIEWS = [
  "This medication has been amazing! My blood pressure is finally under control and I have no side effects at all.",
  "I had a severe allergic reaction — chest pain and difficulty breathing. Stopped taking it immediately.",
  "It seems to work okay but I feel a bit drowsy in the mornings. Not sure if I should continue.",
];

export default function PatientPage() {
  const [form, setForm]       = useState<FormState>({ review: "", patient_id: "", drug_name: "", condition: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.review.trim()) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    setRecommendations(null);

    try {
      const result = await api.submitFeedback({
        review: form.review,
        patient_id: form.patient_id || undefined,
        drug_name:  form.drug_name  || undefined,
        condition:  form.condition  || undefined,
      });
      setFeedback(result);

      if (form.condition && form.patient_id) {
        try {
          const recs = await api.getRecommendations(form.condition, form.patient_id, result.sentiment);
          setRecommendations(recs);
        } catch {
          // recommendations are optional — don't block on this
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm({ review: "", patient_id: "", drug_name: "", condition: "" });
    setFeedback(null);
    setRecommendations(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Patient Portal</h1>
        <p className="section-subtitle">
          Submit medication feedback for AI-powered sentiment analysis and risk classification
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Form */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="card space-y-5">
            {/* Review textarea */}
            <div>
              <label className="label">
                <FileText className="inline h-3 w-3 mr-1" />
                Medication Feedback <span className="text-red-400">*</span>
              </label>
              <textarea
                className="input-field resize-none"
                rows={5}
                placeholder="Describe your experience with this medication — side effects, effectiveness, how you feel..."
                value={form.review}
                onChange={set("review")}
                required
              />
              <p className="mt-1 text-xs text-slate-400">{form.review.length} characters</p>
            </div>

            {/* Patient ID + Drug */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <User className="inline h-3 w-3 mr-1" />
                  Patient ID
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. P-00001"
                  value={form.patient_id}
                  onChange={set("patient_id")}
                />
              </div>
              <div>
                <label className="label">
                  <Pill className="inline h-3 w-3 mr-1" />
                  Drug Name
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Metformin"
                  value={form.drug_name}
                  onChange={set("drug_name")}
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="label">
                <Stethoscope className="inline h-3 w-3 mr-1" />
                Condition <span className="text-slate-400 font-normal normal-case">(for recommendations)</span>
              </label>
              <select className="input-field" value={form.condition} onChange={set("condition")}>
                <option value="">— Select condition —</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading || !form.review.trim()}>
                {loading ? <Spinner className="h-4 w-4 text-white" /> : <Send className="h-4 w-4" />}
                {loading ? "Analysing…" : "Analyse Feedback"}
              </button>
              {feedback && (
                <button type="button" onClick={reset} className="btn-secondary flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Example reviews */}
          <div className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Try an example review
            </p>
            <div className="space-y-2">
              {EXAMPLE_REVIEWS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setForm((f) => ({ ...f, review: ex }))}
                  className="w-full text-left text-xs text-slate-600 hover:text-navy rounded-lg
                    border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50
                    px-3 py-2.5 transition-all duration-150 leading-relaxed"
                >
                  &ldquo;{ex}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results column */}
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">Analysis Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
              <p className="text-xs text-red-400 mt-2">
                Make sure the FastAPI backend is running: <code className="font-mono">uvicorn api.main:app --reload</code>
              </p>
            </div>
          )}

          {!feedback && !loading && !error && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Send className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-400">No analysis yet</p>
              <p className="text-xs text-slate-300 mt-1">Submit a review to see sentiment and risk results</p>
            </div>
          )}

          {loading && (
            <div className="card flex flex-col items-center justify-center py-16 gap-3">
              <Spinner className="h-8 w-8 text-teal-500" />
              <p className="text-sm text-slate-500">Analysing feedback…</p>
            </div>
          )}

          {feedback && <SentimentResult data={feedback} />}
          {recommendations && (
            <RecommendationTable
              items={recommendations.recommendations}
              condition={recommendations.condition}
            />
          )}
        </div>
      </div>
    </div>
  );
}
