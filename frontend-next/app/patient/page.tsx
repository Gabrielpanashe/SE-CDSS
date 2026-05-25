"use client";

import { useEffect, useState } from "react";
import { api, FeedbackResponse, NotificationItem, RecommendResponse, TrendsResponse } from "@/lib/api";
import { SentimentResult } from "@/components/SentimentResult";
import { RecommendationTable } from "@/components/RecommendationTable";
import { SevereRiskAlert } from "@/components/SevereRiskAlert";
import { TrendChart } from "@/components/TrendChart";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Spinner } from "@/components/ui/Spinner";
import { SentimentSkeleton, RecommendationSkeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { CONDITIONS, DRUG_MAP, riskColor, riskDot, sentimentColor, capitalize, formatTimestamp } from "@/lib/utils";
import Image from "next/image";
import {
  Send, RefreshCw, User, Pill, Stethoscope, Info, LogOut,
  MessageCircle, CheckCircle2, History, ClipboardList, Inbox,
  Bell,
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { UserBadge } from "@/components/UserBadge";
import { useRouter } from "next/navigation";
import { logout, getPatientId } from "@/lib/auth";

const MAX_REVIEW = 1000;

type ActiveTab = "submit" | "history" | "messages";

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
  const router    = useRouter();
  const savedPid  = getPatientId();

  // ── Form & analysis ──────────────────────────────────
  const [form, setForm]               = useState<FormState>({ review: "", patient_id: savedPid ?? "", drug_name: "", condition: "" });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [feedback, setFeedback]       = useState<FeedbackResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);

  // ── Tabs ─────────────────────────────────────────────
  const [activeTab, setActiveTab]     = useState<ActiveTab>("submit");

  // ── History ──────────────────────────────────────────
  const [history, setHistory]         = useState<TrendsResponse | null>(null);
  const [histLoading, setHistLoading] = useState(false);

  // ── Notifications & messaging ─────────────────────────
  const [followupReminder, setFollowupReminder]   = useState<NotificationItem | null>(null);
  const [clinicianMessages, setClinicianMessages] = useState<NotificationItem[]>([]);
  const [msgToClinic, setMsgToClinic]             = useState("");
  const [msgSending, setMsgSending]               = useState(false);
  const [msgSent, setMsgSent]                     = useState(false);

  // ── Load notifications + history on mount ─────────────
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

  useEffect(() => {
    const pid = savedPid;
    if (!pid) return;
    setHistLoading(true);
    api.getTrends(pid)
      .then(setHistory)
      .catch(() => setHistory(null))
      .finally(() => setHistLoading(false));
  }, [savedPid]);

  // When user switches to History tab with a typed patient_id (not in localStorage), load history
  useEffect(() => {
    if (activeTab !== "history") return;
    const pid = form.patient_id || savedPid;
    if (!pid || history !== null) return;
    setHistLoading(true);
    api.getTrends(pid)
      .then(setHistory)
      .catch(() => setHistory(null))
      .finally(() => setHistLoading(false));
  }, [activeTab, form.patient_id, savedPid, history]);

  // ── Handlers ──────────────────────────────────────────
  async function dismissClinicianMessage(id: number) {
    await api.markNotificationRead(id).catch(() => null);
    setClinicianMessages((prev) => prev.filter((n) => n.id !== id));
  }

  async function sendMessageToClinic() {
    if (!msgToClinic.trim()) return;
    setMsgSending(true);
    try {
      await api.sendPatientMessage(msgToClinic.trim());
      setMsgSent(true);
      setMsgToClinic("");
    } catch {
      // non-critical
    } finally {
      setMsgSending(false);
    }
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
        review:     form.review,
        patient_id: form.patient_id || undefined,
        drug_name:  form.drug_name  || undefined,
        condition:  form.condition  || undefined,
      });
      setFeedback(result);
      if (form.condition && form.patient_id) {
        try {
          const recs = await api.getRecommendations(form.condition, form.patient_id, result.sentiment);
          setRecommendations(recs);
        } catch { /* optional */ }
      }
      // Refresh history after submission
      if (form.patient_id) {
        api.getTrends(form.patient_id).then(setHistory).catch(() => null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm((f) => ({ ...f, review: "", drug_name: "" }));
    setFeedback(null);
    setRecommendations(null);
    setError(null);
  }

  const unreadCount = clinicianMessages.length;

  return (
    <AuthGate role="patient">
    <div className="space-y-6">

      {/* ── Header banner ────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden min-h-[140px] flex items-center shadow-card">
        <Image
          src="/images/custom/patientfeedback_portalbanner.jpg"
          alt="Patient portal"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/30" />
        <div className="relative z-10 flex w-full items-center justify-between gap-4 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <User className="h-4 w-4 text-blue-300" />
              <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wide">Patient Portal</p>
            </div>
            <h1 className="text-xl font-extrabold text-white leading-tight">Medication Feedback & Analysis</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit a review · view your history · message your care team
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <UserBadge />
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3 py-2
                text-sm font-medium text-white hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Follow-up reminder ───────────────────────────── */}
      {followupReminder && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800
          bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">{followupReminder.message}</p>
        </div>
      )}

      {/* ── Clinician message alert banner ───────────────── */}
      {unreadCount > 0 && activeTab !== "messages" && (
        <button
          onClick={() => setActiveTab("messages")}
          className="w-full flex items-center gap-3 rounded-2xl border border-blue-200 dark:border-blue-800/50
            bg-blue-50 dark:bg-blue-950/20 px-4 py-3 text-left hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {unreadCount} new message{unreadCount > 1 ? "s" : ""} from your Care Team
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Click to open your inbox</p>
          </div>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {unreadCount}
          </span>
        </button>
      )}

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shadow-sm w-full sm:w-fit">
        {(
          [
            { key: "submit",   label: "Submit Review",  icon: Send          },
            { key: "history",  label: "My History",     icon: ClipboardList },
            { key: "messages", label: "Messages",       icon: Inbox         },
          ] as { key: ActiveTab; label: string; icon: React.ElementType }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${activeTab === key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {key === "messages" && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center
                rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
            {key === "history" && (history?.total_entries ?? 0) > 0 && (
              <span className="text-[10px] opacity-70">({history!.total_entries})</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: Submit Review
      ══════════════════════════════════════════════════════ */}
      {activeTab === "submit" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="card space-y-5">
              <div>
                <label className="label">
                  <Stethoscope className="inline h-3 w-3 mr-1" />
                  Condition <span className="text-red-400 normal-case font-normal">*</span>
                </label>
                <select className="input-field" value={form.condition} onChange={set("condition")} required>
                  <option value="">— Select condition —</option>
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  <Info className="inline h-2.5 w-2.5 mr-1" />
                  Selecting a condition filters the drug list and tailors recommendations.
                </p>
              </div>

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
                    ? `Review is too long. Shorten to under ${MAX_REVIEW} characters.`
                    : "Be as descriptive as possible — the more detail, the more accurate the analysis."}
                </FieldDescription>
              </Field>

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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Try an example review</p>
              <div className="space-y-2">
                {EXAMPLE_REVIEWS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setForm((f) => ({ ...f, review: ex }))}
                    className="w-full text-left text-xs text-slate-600 hover:text-slate-900 dark:hover:text-slate-50 rounded-lg
                      border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700
                      hover:bg-blue-50/50 dark:hover:bg-blue-900/20 px-3 py-2.5 transition-all duration-150 leading-relaxed"
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
                <p className="text-xs text-red-400 mt-2">Please try again or check the backend is running.</p>
              </div>
            )}

            {!feedback && !loading && !error && (
              <div className="card flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
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
              <RecommendationTable items={recommendations.recommendations} condition={recommendations.condition} />
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: My History
      ══════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-5">
          {!(form.patient_id || savedPid) && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                <User className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No Patient ID linked</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Add your Patient ID (P-XXXXX) when submitting a review to link your submissions and view history here.
              </p>
              <button onClick={() => setActiveTab("submit")}
                className="mt-4 btn-primary text-sm flex items-center gap-2">
                <Send className="h-4 w-4" /> Go to Submit Review
              </button>
            </div>
          )}

          {(form.patient_id || savedPid) && histLoading && (
            <div className="card flex flex-col items-center justify-center py-16 gap-3">
              <Spinner className="h-8 w-8 text-blue-500" />
              <p className="text-sm text-slate-500">Loading your history…</p>
            </div>
          )}

          {(form.patient_id || savedPid) && !histLoading && history && history.total_entries === 0 && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <History className="h-8 w-8 text-slate-200 mb-3" />
              <p className="text-sm font-semibold text-slate-400">No submissions yet</p>
              <p className="text-xs text-slate-300 mt-1">Your review history will appear here after your first submission.</p>
              <button onClick={() => setActiveTab("submit")}
                className="mt-4 btn-primary text-sm flex items-center gap-2">
                <Send className="h-4 w-4" /> Submit your first review
              </button>
            </div>
          )}

          {(form.patient_id || savedPid) && !histLoading && history && history.total_entries > 0 && (
            <>
              {/* Patient summary bar */}
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-900/10 px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Your Health Overview</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-center">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{history.total_entries}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Reviews</p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-center">
                    <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                      {Math.round(history.trends.reduce((s, t) => s + t.confidence, 0) / history.total_entries * 100)}%
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Avg Confidence</p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-center">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50 capitalize">
                      {history.trends.at(-1)?.sentiment ?? "—"}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Latest Sentiment</p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-center">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                      {history.trends.at(-1)?.risk_level ?? "—"}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Latest Risk</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5">
                  Patient ID: <span className="font-semibold text-slate-600 dark:text-slate-300">{history.patient_id}</span>
                  {" · "}
                  First submission: <span className="font-medium">{formatTimestamp(history.trends[0].timestamp)}</span>
                  {" · "}
                  Latest: <span className="font-medium">{formatTimestamp(history.trends.at(-1)!.timestamp)}</span>
                </p>
              </div>

              {/* Trend chart */}
              <TrendChart trends={history.trends} />

              {/* Submissions table */}
              <div className="card overflow-x-auto">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-blue-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Submission History</h3>
                  <span className="ml-auto text-xs text-slate-400">{history.total_entries} record{history.total_entries !== 1 ? "s" : ""}</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase tracking-wide text-[10px]">
                      <th className="pb-2 text-left px-1">#</th>
                      <th className="pb-2 text-left px-1">Sentiment</th>
                      <th className="pb-2 text-left px-1">Confidence</th>
                      <th className="pb-2 text-left px-1">Risk Level</th>
                      <th className="pb-2 text-left px-1">Condition</th>
                      <th className="pb-2 text-left px-1">Drug</th>
                      <th className="pb-2 text-left px-1">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {[...history.trends].reverse().map((t) => (
                      <tr key={t.log_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-1 text-slate-400 tabular-nums">#{t.log_id}</td>
                        <td className="py-2.5 px-1">
                          <Badge className={sentimentColor(t.sentiment)}>{capitalize(t.sentiment)}</Badge>
                        </td>
                        <td className="py-2.5 px-1 tabular-nums text-slate-600 dark:text-slate-300">
                          {(t.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-1">
                          <Badge className={riskColor(t.risk_level)}>
                            <span className={`h-1.5 w-1.5 rounded-full ${riskDot(t.risk_level)}`} />
                            {t.risk_level}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-1 text-slate-600 dark:text-slate-300 capitalize">{t.condition ?? "—"}</td>
                        <td className="py-2.5 px-1 text-slate-600 dark:text-slate-300">{t.drug_name ?? "—"}</td>
                        <td className="py-2.5 px-1 text-slate-400">{formatTimestamp(t.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <DisclaimerBanner text={history.disclaimer} />
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: Messages
      ══════════════════════════════════════════════════════ */}
      {activeTab === "messages" && (
        <div className="grid gap-6 lg:grid-cols-2">

          {/* LEFT: Inbox from clinician */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Inbox className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Inbox</h2>
                <p className="text-[11px] text-slate-400">Messages from your care team</p>
              </div>
              {unreadCount > 0 && (
                <span className="ml-auto text-xs font-bold bg-blue-600 text-white rounded-full px-2 py-0.5">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {clinicianMessages.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-14 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <Stethoscope className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">No messages yet</p>
                <p className="text-xs text-slate-300 mt-1">Your clinician&apos;s messages will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clinicianMessages.map((msg) => (
                  <div key={msg.id}
                    className="rounded-2xl border border-blue-100 dark:border-blue-800 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                          <Stethoscope className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Your Clinician</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatTimestamp(msg.created_at)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissClinicianMessage(msg.id)}
                        title="Mark as read"
                        className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-slate-400
                          hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mt-3 pl-10">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Send message to clinician */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Message your Care Team</h2>
                <p className="text-[11px] text-slate-400">Send a question or update to your clinician</p>
              </div>
            </div>

            <div className="card space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Use this to ask questions about your medication, report new side effects, or share updates.
                Your clinician will see this in their notification panel.
              </p>

              {msgSent ? (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-5 text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Message sent to your care team!</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Your clinician will see it in their portal shortly.
                  </p>
                  <button onClick={() => setMsgSent(false)}
                    className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 underline font-medium">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <textarea
                    rows={5}
                    className="input-field resize-none text-sm"
                    placeholder="e.g. I've been experiencing dizziness since starting Amlodipine — should I be concerned?"
                    value={msgToClinic}
                    onChange={(e) => setMsgToClinic(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">{msgToClinic.length}/500 characters</p>
                    <button
                      onClick={sendMessageToClinic}
                      disabled={msgSending || !msgToClinic.trim()}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      {msgSending ? <Spinner className="h-4 w-4 text-white" /> : <Send className="h-4 w-4" />}
                      {msgSending ? "Sending…" : "Send Message"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Info card */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">How messaging works</p>
              <ul className="space-y-1">
                {[
                  "Your message is sent instantly to your clinician's portal",
                  "The clinician can reply — you'll see it in your Inbox",
                  "All messages are private and linked to your account",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
    </AuthGate>
  );
}
