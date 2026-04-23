"use client";
import { RecommendationItem } from "@/lib/api";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { scoreBar, formatPercent } from "@/lib/utils";
import { Award, Pill, FlaskConical, Heart, Activity } from "lucide-react";

interface Props {
  items: RecommendationItem[];
  condition: string;
}

const RANK_STYLE = [
  { border: "border-yellow-300",   bg: "bg-yellow-50",      badge: "bg-yellow-400 text-white", label: "1st" },
  { border: "border-slate-300",    bg: "bg-slate-50",       badge: "bg-slate-400 text-white",  label: "2nd" },
  { border: "border-amber-700/30", bg: "bg-orange-50/50",   badge: "bg-amber-700 text-white",  label: "3rd" },
];

const SCORE_ROWS: Array<{
  key: keyof RecommendationItem;
  label: string;
  icon: React.ElementType;
  color: string;
}> = [
  { key: "guideline_score", label: "Guideline", icon: FlaskConical, color: "bg-blue-500"   },
  { key: "ehr_score",       label: "EHR Match", icon: Heart,        color: "bg-purple-500" },
  { key: "sentiment_score", label: "Sentiment", icon: Activity,     color: "bg-teal-500"   },
];

export function RecommendationTable({ items, condition }: Props) {
  const sorted = [...items].sort((a, b) => b.recommendation_score - a.recommendation_score);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-teal-500" />
        <div>
          <h3 className="font-bold text-navy text-sm">Drug Recommendations</h3>
          <p className="text-xs text-slate-400 capitalize">
            {condition} · 0.33 × Guideline + 0.33 × EHR + 0.33 × Sentiment
          </p>
        </div>
      </div>

      {/* Ranked cards */}
      {sorted.map((item, i) => {
        const rank = RANK_STYLE[i] ?? RANK_STYLE[2];
        return (
          <div
            key={item.drug}
            className={`rounded-2xl border-2 ${rank.border} ${rank.bg} p-4 transition-shadow hover:shadow-card`}
          >
            {/* Drug name + overall score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow ${rank.badge}`}>
                  {rank.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-navy/50" />
                  <span className="font-bold text-navy text-sm">{item.drug}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Overall</p>
                <p className="text-lg font-extrabold text-navy tabular-nums">
                  {formatPercent(item.recommendation_score)}
                </p>
              </div>
            </div>

            {/* Overall progress bar */}
            <ProgressBar
              value={item.recommendation_score}
              barClassName={scoreBar(item.recommendation_score)}
              className="mb-4"
            />

            {/* Component score breakdown */}
            <div className="grid grid-cols-3 gap-2">
              {SCORE_ROWS.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="rounded-xl bg-white/80 border border-white px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className="h-3 w-3 text-slate-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-navy tabular-nums">
                    {formatPercent(item[key] as number)}
                  </p>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${(item[key] as number) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-slate-400 text-center pt-1">
        Advisory only · review with a qualified clinician before any clinical action.
      </p>
    </div>
  );
}
