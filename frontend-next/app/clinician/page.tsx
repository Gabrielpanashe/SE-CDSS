"use client";

import { useEffect, useState } from "react";
import { api, TrendsResponse, RecommendResponse, NotificationItem } from "@/lib/api";
import { TrendChart } from "@/components/TrendChart";
import { RecommendationTable } from "@/components/RecommendationTable";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { CONDITIONS, riskColor, riskDot, sentimentColor, capitalize, formatTimestamp } from "@/lib/utils";
import Image from "next/image";
import { Search, Stethoscope, Activity, BarChart2, History, RefreshCw, Bell, CheckCheck, LogOut } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useRouter } from "next/navigation";
import { logout, getDisplayName, getEmail } from "@/lib/auth";

type Tab = "trends" | "recommendations";

export default function ClinicianPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [condition, setCondition] = useState("");
  const [sentiment, setSentiment] = useState("positive");
  const [tab, setTab] = useState<Tab>("trends");

  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [trends, setTrends]               = useState<TrendsResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);
  const [recLoading, setRecLoading]       = useState(false);
  const [recError, setRecError]           = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotif, setShowNotif]         = useState(false);

  const [patientUserId, setPatientUserId] = useState<number | null>(null);
  const [msgText, setMsgText]             = useState("");
  const [msgSending, setMsgSending]       = useState(false);
  const [msgSent, setMsgSent]             = useState(false);

  useEffect(() => {
    api.getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  async function dismissNotification(id: number) {
    await api.markNotificationRead(id).catch(() => null);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function lookupTrends(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId.trim()) return;
    setLoading(true);
    setError(null);
    setTrends(null);
    setPatientUserId(null);
    setMsgSent(false);
    try {
      const [data, userInfo] = await Promise.allSettled([
        api.getTrends(patientId.trim()),
        api.getPatientUserId(patientId.trim()),
      ]);
      if (data.status === "fulfilled") { setTrends(data.value); setTab("trends"); }
      else throw new Error((data.reason as Error).message);
      if (userInfo.status === "fulfilled") setPatientUserId(userInfo.value.user_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load patient data.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!patientUserId || !msgText.trim()) return;
    setMsgSending(true);
    const latestLogId = trends?.trends.at(-1)?.log_id;
    try {
      await api.respondToPatient(patientUserId, msgText.trim(), latestLogId);
      setMsgSent(true);
      setMsgText("");
    } finally {
      setMsgSending(false);
    }
  }

  async function loadRecommendations() {
    if (!condition || !patientId.trim()) return;
    setRecLoading(true);
    setRecError(null);
    try {
      const data = await api.getRecommendations(condition, patientId.trim(), sentiment);
      setRecommendations(data);
      setTab("recommendations");
    } catch (err: unknown) {
      setRecError(err instanceof Error ? err.message : "Failed to load recommendations.");
    } finally {
      setRecLoading(false);
    }
  }

  const latestSentiment = trends?.trends.at(-1)?.sentiment ?? null;
  const clinicianName   = getDisplayName() ?? getEmail() ?? "Clinician";

  return (
    <AuthGate role="clinician">
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative rounded-2xl overflow-hidden min-h-[110px] flex items-center shadow-card">
        <Image
          src="/images/custom/ehrintegration.jpg"
          alt="Clinician dashboard"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
        <div className="relative z-10 flex w-full items-center justify-between gap-4 px-6 py-4">
          {/* Left: identity */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Stethoscope className="h-3.5 w-3.5 text-blue-300" />
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Clinician Portal</p>
            </div>
            <p className="text-lg font-extrabold text-white leading-tight">{clinicianName}</p>
          </div>
          {/* Right: action buttons */}
          <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3 py-2
              text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            <Bell className="h-4 w-4 text-blue-300" />
            Notifications
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center
                rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-3 py-2
              text-sm font-medium text-white hover:bg-red-500/30 hover:border-red-400/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
        </div>
      </div>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Patient Monitoring &amp; Recommendations
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Look up patients · view sentiment trends · generate drug recommendations
        </p>
      </div>

      {/* Notification panel */}
      {showNotif && (
        <div className="card space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Unread Notifications</p>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">All caught up!</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl
                bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 capitalize mb-0.5">
                    {n.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{n.message}</p>
                  {n.followup_due_at && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due: {new Date(n.followup_due_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismissNotification(n.id)}
                  title="Mark as read"
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar controls */}
        <div className="space-y-4">
          {/* Patient lookup */}
          <form onSubmit={lookupTrends} className="card space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-4 w-4 text-blue-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Patient Lookup</h2>
            </div>
            <div>
              <label className="label">Patient ID</label>
              <input
                className="input-field"
                placeholder="e.g. P-00001"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading || !patientId.trim()}>
              {loading ? <Spinner className="h-4 w-4 text-white" /> : <Activity className="h-4 w-4" />}
              {loading ? "Loading…" : "Load Patient Data"}
            </button>
          </form>

          {/* Recommendations form */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="h-4 w-4 text-blue-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Drug Recommendations</h2>
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="input-field" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="">— Select —</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Override Sentiment</label>
              <select className="input-field" value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              {latestSentiment && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Latest on record:{" "}
                  <span className={`font-semibold ${latestSentiment === "positive" ? "text-green-600" : latestSentiment === "negative" ? "text-red-600" : "text-amber-600"}`}>
                    {capitalize(latestSentiment)}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={loadRecommendations}
              disabled={recLoading || !condition || !patientId.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {recLoading ? <Spinner className="h-4 w-4 text-white" /> : <BarChart2 className="h-4 w-4" />}
              {recLoading ? "Loading…" : "Get Recommendations"}
            </button>
            {recError && <p className="text-xs text-red-500">{recError}</p>}
          </div>

          {/* Quick stats */}
          {trends && (
            <div className="card space-y-3">
              <p className="label">Patient Summary</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{trends.total_entries}</p>
                  <p className="text-xs text-slate-400">Total Records</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {trends.total_entries > 0
                      ? Math.round(trends.trends.reduce((s, t) => s + t.confidence, 0) / trends.total_entries * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-slate-400">Avg Confidence</p>
                </div>
              </div>
              {trends.total_entries > 0 && (
                <div>
                  <p className="label mb-2">Latest Entry</p>
                  <div className="space-y-1">
                    {(() => {
                      const last = trends.trends.at(-1)!;
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Sentiment</span>
                            <Badge className={sentimentColor(last.sentiment)}>{capitalize(last.sentiment)}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Risk</span>
                            <Badge className={riskColor(last.risk_level)}>
                              <span className={`h-1.5 w-1.5 rounded-full ${riskDot(last.risk_level)}`} />
                              {last.risk_level}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-300 text-right">{formatTimestamp(last.timestamp)}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Patient */}
          {patientUserId && (
            <div className="card space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="h-4 w-4 text-blue-500" />
                <h2 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Message Patient</h2>
              </div>
              {msgSent ? (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2.5 text-center">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Message sent!</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">The patient will see it in their portal.</p>
                  <button onClick={() => setMsgSent(false)} className="mt-2 text-xs text-blue-600 dark:text-blue-400 underline">Send another</button>
                </div>
              ) : (
                <>
                  <textarea
                    rows={3}
                    className="input-field resize-none text-sm"
                    placeholder={`Write a message to patient ${patientId}…`}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={msgSending || !msgText.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    {msgSending ? <Spinner className="h-4 w-4 text-white" /> : <Bell className="h-4 w-4" />}
                    {msgSending ? "Sending…" : "Send to Patient Portal"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="space-y-4 min-w-0">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">Lookup Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          )}

          {!trends && !loading && !error && (
            <div className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <Image
                src="/images/custom/dashboardemptystate.jpg"
                alt="Select a patient to get started"
                fill
                sizes="100vw"
                className="object-cover object-center opacity-30 dark:opacity-20"
              />
              <div className="relative z-10 text-center px-6 py-10">
                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 shadow-card flex items-center justify-center mb-4 mx-auto">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-200">No patient selected</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Enter a Patient ID in the panel on the left and click &ldquo;Load Patient Data&rdquo; to begin.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="card flex flex-col items-center justify-center py-24 gap-3">
              <Spinner className="h-8 w-8 text-blue-500" />
              <p className="text-sm text-slate-500">Loading patient records…</p>
            </div>
          )}

          {trends && trends.total_entries === 0 && (
            <div className="card flex flex-col items-center justify-center py-24 text-center">
              <History className="h-8 w-8 text-slate-200 mb-3" />
              <p className="text-sm font-semibold text-slate-400">No records found</p>
              <p className="text-xs text-slate-300 mt-1">Patient <strong>{trends.patient_id}</strong> has no prediction logs yet.</p>
              <p className="text-xs text-slate-300 mt-0.5">Submit feedback in the Patient Portal first.</p>
            </div>
          )}

          {trends && trends.total_entries > 0 && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 rounded-xl bg-white border border-slate-200 p-1 w-fit shadow-sm">
                {(["trends", "recommendations"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                      tab === t ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "trends" && (
                <div className="space-y-4">
                  {/* Patient info panel */}
                  {(() => {
                    const last = trends.trends.at(-1)!;
                    const first = trends.trends[0];
                    const condition = last.condition ?? trends.trends.find(t => t.condition)?.condition;
                    const drug = last.drug_name ?? trends.trends.find(t => t.drug_name)?.drug_name;
                    return (
                      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-900/10 px-5 py-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                            <Stethoscope className="h-3.5 w-3.5 text-white" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Patient Information</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Patient ID</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{trends.patient_id}</p>
                          </div>
                          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Condition</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-50 capitalize">{condition ?? "—"}</p>
                          </div>
                          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Latest Drug</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{drug ?? "—"}</p>
                          </div>
                          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Records</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                              {trends.total_entries} <span className="text-xs font-normal text-slate-400">entries</span>
                            </p>
                          </div>
                        </div>
                        {first && (
                          <p className="text-[11px] text-slate-400 mt-2.5">
                            First entry: <span className="font-medium text-slate-500">{formatTimestamp(first.timestamp)}</span>
                            {" · "}
                            Latest: <span className="font-medium text-slate-500">{formatTimestamp(last.timestamp)}</span>
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <TrendChart trends={trends.trends} />

                  {/* History table */}
                  <div className="card overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="h-4 w-4 text-blue-500" />
                      <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Full History</h3>
                      <button onClick={() => lookupTrends({ preventDefault: () => {} } as React.FormEvent)}
                        className="ml-auto text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Refresh
                      </button>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wide">
                          <th className="pb-2 text-left px-1">ID</th>
                          <th className="pb-2 text-left px-1">Sentiment</th>
                          <th className="pb-2 text-left px-1">Conf.</th>
                          <th className="pb-2 text-left px-1">Risk</th>
                          <th className="pb-2 text-left px-1">Condition</th>
                          <th className="pb-2 text-left px-1">Drug</th>
                          <th className="pb-2 text-left px-1">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[...trends.trends].reverse().map((t) => (
                          <tr key={t.log_id} className="hover:bg-slate-50/60">
                            <td className="py-2 px-1 text-slate-400 tabular-nums">#{t.log_id}</td>
                            <td className="py-2 px-1">
                              <Badge className={sentimentColor(t.sentiment)}>{capitalize(t.sentiment)}</Badge>
                            </td>
                            <td className="py-2 px-1 tabular-nums text-slate-600">{(t.confidence * 100).toFixed(0)}%</td>
                            <td className="py-2 px-1">
                              <Badge className={riskColor(t.risk_level)}>
                                <span className={`h-1.5 w-1.5 rounded-full ${riskDot(t.risk_level)}`} />
                                {t.risk_level}
                              </Badge>
                            </td>
                            <td className="py-2 px-1 text-slate-600 capitalize">{t.condition ?? "—"}</td>
                            <td className="py-2 px-1 text-slate-600">{t.drug_name ?? "—"}</td>
                            <td className="py-2 px-1 text-slate-400">{formatTimestamp(t.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "recommendations" && recommendations && (
                <div className="space-y-4">
                  <RecommendationTable
                    items={recommendations.recommendations}
                    condition={recommendations.condition}
                  />
                  <DisclaimerBanner text={recommendations.disclaimer} />
                </div>
              )}

              {tab === "recommendations" && !recommendations && (
                <div className="card flex flex-col items-center justify-center py-16 text-center">
                  <BarChart2 className="h-8 w-8 text-slate-200 mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No recommendations loaded</p>
                  <p className="text-xs text-slate-300 mt-1">Select a condition and click &ldquo;Get Recommendations&rdquo;</p>
                </div>
              )}

              <DisclaimerBanner text={trends.disclaimer} />
            </>
          )}
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
