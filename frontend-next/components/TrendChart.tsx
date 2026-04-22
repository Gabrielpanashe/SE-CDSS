"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { TrendEntry } from "@/lib/api";
import { formatTimestamp } from "@/lib/utils";

interface Props { trends: TrendEntry[] }

const SENTIMENT_VALUE = { positive: 1, neutral: 0.5, negative: 0 } as Record<string, number>;

export function TrendChart({ trends }: Props) {
  const data = trends.map((t) => ({
    label: formatTimestamp(t.timestamp).split(",")[0],
    confidence: +(t.confidence * 100).toFixed(1),
    sentimentValue: SENTIMENT_VALUE[t.sentiment.toLowerCase()] ?? 0.5,
    sentiment: t.sentiment,
    risk: t.risk_level,
    drug: t.drug_name ?? "—",
    timestamp: formatTimestamp(t.timestamp),
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof data[0] }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card text-xs space-y-1">
        <p className="font-semibold text-navy">{d.timestamp}</p>
        <p>Sentiment: <span className="font-semibold capitalize">{d.sentiment}</span></p>
        <p>Confidence: <span className="font-semibold">{d.confidence}%</span></p>
        <p>Risk: <span className="font-semibold">{d.risk}</span></p>
        {d.drug !== "—" && <p>Drug: <span className="font-semibold">{d.drug}</span></p>}
      </div>
    );
  };

  const dotColor = (entry: typeof data[0]) =>
    entry.sentiment === "positive" ? "#22C55E" :
    entry.sentiment === "negative" ? "#EF4444" : "#F59E0B";

  return (
    <div className="card">
      <h3 className="font-bold text-navy mb-1">Sentiment Trend</h3>
      <p className="text-xs text-slate-400 mb-4">{trends.length} entries</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} />
          <YAxis
            yAxisId="conf"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            unit="%"
          />
          <YAxis
            yAxisId="sent"
            orientation="right"
            domain={[0, 1]}
            ticks={[0, 0.5, 1]}
            tickFormatter={(v) => ["Neg", "Neu", "Pos"][v === 0 ? 0 : v === 0.5 ? 1 : 2]}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            formatter={(v) => v === "confidence" ? "Confidence %" : "Sentiment"}
          />
          <ReferenceLine yAxisId="conf" y={60} stroke="#F59E0B" strokeDasharray="4 2" strokeWidth={1} />
          <Line
            yAxisId="conf"
            type="monotone"
            dataKey="confidence"
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return <circle key={payload.timestamp} cx={cx} cy={cy} r={4} fill={dotColor(payload)} stroke="white" strokeWidth={1.5} />;
            }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="sent"
            type="monotone"
            dataKey="sentimentValue"
            stroke="#8AAAC8"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 text-center mt-2">
        Dots coloured by sentiment • Dashed line at 60% = moderate confidence threshold
      </p>
    </div>
  );
}
