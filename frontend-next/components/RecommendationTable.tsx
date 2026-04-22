"use client";
import { RecommendationItem } from "@/lib/api";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { scoreBar, formatPercent } from "@/lib/utils";
import { Award } from "lucide-react";

interface Props {
  items: RecommendationItem[];
  condition: string;
}

export function RecommendationTable({ items, condition }: Props) {
  const sorted = [...items].sort((a, b) => b.recommendation_score - a.recommendation_score);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <Award className="h-5 w-5 text-teal-500" />
        <div>
          <h3 className="font-bold text-navy">Drug Recommendations</h3>
          <p className="text-xs text-slate-400 capitalize">{condition}</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">#</th>
              <th className="text-left px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Drug</th>
              <th className="text-left px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Guideline</th>
              <th className="text-left px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">EHR</th>
              <th className="text-left px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Sentiment</th>
              <th className="text-left px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 min-w-[120px]">Overall Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map((item, i) => (
              <tr key={item.drug} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-2 py-3">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>{i + 1}</span>
                </td>
                <td className="px-2 py-3 font-semibold text-navy">{item.drug}</td>
                <td className="px-2 py-3 text-slate-600 tabular-nums">{formatPercent(item.guideline_score)}</td>
                <td className="px-2 py-3 text-slate-600 tabular-nums">{formatPercent(item.ehr_score)}</td>
                <td className="px-2 py-3 text-slate-600 tabular-nums">{formatPercent(item.sentiment_score)}</td>
                <td className="px-2 py-3 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <ProgressBar value={item.recommendation_score} barClassName={scoreBar(item.recommendation_score)} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-10 text-right tabular-nums">
                      {formatPercent(item.recommendation_score)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-400 text-center">
        Scores are weighted equally: Guideline (33%) + EHR (33%) + Sentiment (33%)
      </p>
    </div>
  );
}
