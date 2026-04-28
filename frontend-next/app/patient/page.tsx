"use client";

import { useEffect, useState } from "react";
import { api, FeedbackResponse, NotificationItem, RecommendResponse } from "@/lib/api";
import { SentimentResult } from "@/components/SentimentResult";
import { RecommendationTable } from "@/components/RecommendationTable";
import { SevereRiskAlert } from "@/components/SevereRiskAlert";
import { Spinner } from "@/components/ui/Spinner";
import { SentimentSkeleton, RecommendationSkeleton } from "@/components/ui/Skeleton";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { CONDITIONS, DRUG_MAP } from "@/lib/utils";
import { Send, RefreshCw, User, Pill, Stethoscope, Info, LogOut } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { UserBadge } from "@/components/UserBadge";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const MAX_REVIEW = 1000;

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
  const router = useRouter();
  const [form, setForm]       = useState<FormState>({ review: "", patient_id: "", drug_name: "", condition: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);
  const [followupReminder, setFollowupReminder]     = useState<NotificationItem | null>(null);
  const [clinicianMessages, setClinicianMessages]   = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.getNotifications()
      .then((items) => {
        const due = items.find(
          (n) => n.type === "followup_reminder" && n.followup_due_at && new Date(n.followup_due_at) <= new Date()
        );
        setFollowupReminder(due ?? null);
        setClinicianMessages(items.filter((n) => n.type === "clinician_response"));
      })
      .catch(() => null);
  }, []);

  async function dismissClinicianMessage(id: number) {
    await api.markNotificationRead(id).catch(() => null);
    setClinicianMessages((prev) => prev.filter((n) => n.id !== id));
  }

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
    <AuthGate role="patient">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Patient Portal</h1>
          <p className="section-subtitle">
            Submit medication feedback for AI-powered sentiment analysis and risk classification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserBadge />
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300
              hover:border-red-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Follow-up reminder banner */}
      {followupReminder && (
        <div className="flex items-start gap-3 rounded-xl border border-teal-200 dark:border-teal-800
          bg-teal-50 dark:bg-teal-900/20 px-4 py-3">
          <Info className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
          <p className="text-sm text-teal-700 dark:text-teal-300">{followupReminder.message}</p>
        </div>
      )}

      {/* Clinician messages */}
      {clinicianMessages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Messages from your Clinician</p>
          {clinicianMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 rounded-xl border border-navy/20 dark:border-slate-600
              bg-navy/5 dark:bg-slate-700/50 px-4 py-3">
              <Stethoscope className="h-4 w-4 text-navy dark:text-slate-300 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-navy dark:text-slate-200 mb-0.5">Your Clinician</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{msg.message}</p>
              </div>
              <button
                onClick={() => dismissClinicianMessage(msg.id)}
                title="Dismiss"
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Form */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="card space-y-5">
            {/* Condition — comes first to populate drug dropdown */}
            <div>
              <label className="label">
                <Stethoscope className="inline h-3 w-3 mr-1" />
                Condition <span className="text-red-400 normal-case font-normal">*</span>
              </label>
              <select
                className="input-field"
                value={form.condition}
                onChange={set("condition")}
                required
              >
                <option value="">— Select condition —</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                <Info className="inline h-2.5 w-2.5 mr-1" />
                Your condition determines which medications appear in the drug list and which recommendations are shown.
              </p>
            </div>

            {/* Drug Name — dropdown populated from selected condition */}
            <Field>
              <FieldLabel htmlFor="drug-name">
                <Pill className="inline h-3 w-3 mr-1" />
                Drug Name {form.condition && <span className="text-red-400 normal-case font-normal">*</span>}
              </FieldLabel>
              <select
                id="drug-name"
                className="input-field"
                value={form.drug_name}
                onChange={set("drug_name")}
                required={!!form.condition}
                disabled={!form.condition}
              >
                <option value="">
                  {form.condition ? "— Select drug for this condition —" : "Select a condition first"}
                </option>
                {form.condition && DRUG_MAP[form.condition]?.map((drug) => (
                  <option key={drug} value={drug}>{drug}</option>
                ))}
              </select>
              <FieldDescription>
                {form.condition
                  ? `Available medications for ${CONDITIONS.find(c => c.value === form.condition)?.label}`
                  : "Select a condition above to see available medications"}
              </FieldDescription>
            </Field>

            {/* Patient ID */}
            <Field data-invalid={form.patient_id && !/^P-\d{5}$/.test(form.patient_id) ? true : undefined}>
              <FieldLabel htmlFor="patient-id">
                <User className="inline h-3 w-3 mr-1" />
                Patient ID <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </FieldLabel>
              <input
                id="patient-id"
                className="input-field"
                placeholder="P-00001"
                value={form.patient_id}
                onChange={set("patient_id")}
              />
              <FieldDescription>
                {form.patient_id && !/^P-\d{5}$/.test(form.patient_id)
                  ? "Format: P-XXXXX (e.g. P-00042)"
                  : <span className="flex items-center gap-1"><Info className="h-2.5 w-2.5" /> Format: P-XXXXX or leave blank</span>}
              </FieldDescription>
            </Field>

            {/* Review textarea — shadcn Field pattern */}
            <Field data-invalid={form.review.length > MAX_REVIEW ? true : undefined}>
              <FieldLabel htmlFor="review-input">
                Medication Feedback <span className="text-red-400 normal-case font-normal">*</span>
              </FieldLabel>
              <Textarea
                id="review-input"
                rows={5}
                placeholder="Describe your experience — side effects, improvements, how you feel overall…"
                value={form.review}
                onChange={set("review")}
                showCount
                maxLength={MAX_REVIEW}
                aria-invalid={form.review.length > MAX_REVIEW}
                required
              />
              <FieldDescription>
                {form.review.length > MAX_REVIEW
                  ? `Review is too long. Please shorten to under ${MAX_REVIEW} characters.`
                  : "Be as descriptive as possible — the more detail, the more accurate the analysis."}
              </FieldDescription>
            </Field>

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

          {loading && <SentimentSkeleton />}

          {feedback && (
            <>
              <SevereRiskAlert riskLevel={feedback.risk_level} drugName={form.drug_name || undefined} />
              <SentimentResult data={feedback} />
            </>
          )}
          {loading && recommendations === null && feedback !== null && <RecommendationSkeleton />}
          {recommendations && (
            <RecommendationTable
              items={recommendations.recommendations}
              condition={recommendations.condition}
            />
          )}
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
