"use client";

import { useEffect, useState } from "react";
import { api, TrendsResponse, RecommendResponse, NotificationItem } from "@/lib/api";
import { TrendChart } from "@/components/TrendChart";
import { RecommendationTable } from "@/components/RecommendationTable";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { CONDITIONS, riskColor, riskDot, sentimentColor, capitalize, formatTimestamp } from "@/lib/utils";
import { Search, Stethoscope, Activity, BarChart2, History, RefreshCw, Bell, CheckCheck, LogOut } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { UserBadge } from "@/components/UserBadge";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

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

  return (
    <AuthGate role="clinician">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Clinician Dashboard</h1>
          <p className="section-subtitle">Patient trend monitoring and drug recommendation engine</p>
        </div>
        <div className="flex items-center gap-2">
          <UserBadge />
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300
              hover:border-teal-400 transition-colors"
          >
            <Bell className="h-4 w-4 text-teal-500" />
            Notifications
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center
                rounded-full bg-teal-500 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>
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
                  <p className="text-xs font-semibold text-teal-600 capitalize mb-0.5">
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
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-teal-500 transition-colors"
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
              <Search className="h-4 w-4 text-teal-500" />
              <h2 className="font-bold text-navy text-sm">Patient Lookup</h2>
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
              <Stethoscope className="h-4 w-4 text-teal-500" />
              <h2 className="font-bold text-navy text-sm">Drug Recommendations</h2>
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
                  <p className="text-2xl font-bold text-navy">{trends.total_entries}</p>
                  <p className="text-xs text-slate-400">Total Records</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-2xl font-bold text-teal-600">
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
                <Bell className="h-4 w-4 text-teal-500" />
                <h2 className="font-bold text-navy dark:text-slate-100 text-sm">Message Patient</h2>
              </div>
              {msgSent ? (
                <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 px-3 py-2.5 text-center">
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Message sent!</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">The patient will see it in their portal.</p>
                  <button onClick={() => setMsgSent(false)} className="mt-2 text-xs text-teal-600 underline">Send another</button>
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
            <div className="card flex flex-col items-center justify-center py-24 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-400">No patient selected</p>
              <p className="text-xs text-slate-300 mt-1">Enter a Patient ID and click &ldquo;Load Patient Data&rdquo;</p>
            </div>
          )}

          {loading && (
            <div className="card flex flex-col items-center justify-center py-24 gap-3">
              <Spinner className="h-8 w-8 text-teal-500" />
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
                      tab === t ? "bg-teal-500 text-white shadow-sm" : "text-slate-500 hover:text-navy"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "trends" && (
                <div className="space-y-4">
                  <TrendChart trends={trends.trends} />

                  {/* History table */}
                  <div className="card overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="h-4 w-4 text-teal-500" />
                      <h3 className="font-bold text-navy text-sm">Full History</h3>
                      <button onClick={() => lookupTrends({ preventDefault: () => {} } as React.FormEvent)}
                        className="ml-auto text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1">
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
