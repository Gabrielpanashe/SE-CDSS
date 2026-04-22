"use client";
import { FeedbackResponse } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { capitalize, sentimentColor, riskColor, riskDot } from "@/lib/utils";
import { CheckCircle, AlertCircle, AlertTriangle, TrendingUp } from "lucide-react";

const SentimentIcon = ({ s }: { s: string }) => {
  switch (s) {
    case "positive": return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "negative": return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:         return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  }
};

const probOrder: Array<keyof FeedbackResponse["probabilities"]> = ["positive", "neutral", "negative"];
const barColor = (k: string) =>
  k === "positive" ? "bg-green-500" : k === "negative" ? "bg-red-500" : "bg-amber-400";

export function SentimentResult({ data }: { data: FeedbackResponse }) {
  return (
    <div className="space-y-4">
      {/* Top row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sentiment */}
        <div className="card flex flex-col gap-3">
          <p className="label">Sentiment</p>
          <div className="flex items-center gap-2">
            <SentimentIcon s={data.sentiment} />
            <Badge className={sentimentColor(data.sentiment)}>
              {capitalize(data.sentiment)}
            </Badge>
          </div>
          <ProgressBar
            value={data.confidence}
            barClassName={barColor(data.sentiment)}
            label="Confidence"
            showValue
          />
        </div>

        {/* Risk Level */}
        <div className="card flex flex-col gap-3">
          <p className="label">Clinical Risk</p>
          <Badge className={`text-sm px-3 py-1 ${riskColor(data.risk_level)}`}>
            <span className={`h-2 w-2 rounded-full ${riskDot(data.risk_level)}`} />
            {data.risk_level}
          </Badge>
          <p className="text-xs text-slate-400">
            Based on sentiment + keyword escalation rules
          </p>
        </div>
      </div>

      {/* Probability breakdown */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-teal-500" />
          <p className="font-semibold text-navy text-sm">Class Probabilities</p>
        </div>
        <div className="space-y-3">
          {probOrder.map((key) => (
            <ProgressBar
              key={key}
              value={data.probabilities[key]}
              barClassName={barColor(key)}
              label={capitalize(key)}
              showValue
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner text={data.disclaimer} />
    </div>
  );
}
