import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function riskColor(riskLevel: string): string {
  const r = riskLevel.toLowerCase();
  if (r.includes("severe")) return "text-red-600 bg-red-50 border-red-200";
  if (r.includes("moderate")) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-green-600 bg-green-50 border-green-200";
}

export function riskDot(riskLevel: string): string {
  const r = riskLevel.toLowerCase();
  if (r.includes("severe")) return "bg-red-500";
  if (r.includes("moderate")) return "bg-amber-500";
  return "bg-green-500";
}

export function sentimentColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case "positive": return "text-green-700 bg-green-50 border-green-200";
    case "negative": return "text-red-700 bg-red-50 border-red-200";
    default: return "text-amber-700 bg-amber-50 border-amber-200";
  }
}

export function sentimentHex(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case "positive": return "#22C55E";
    case "negative": return "#EF4444";
    default: return "#F59E0B";
  }
}

export function scoreBar(score: number): string {
  if (score >= 0.85) return "bg-green-500";
  if (score >= 0.70) return "bg-teal-500";
  if (score >= 0.55) return "bg-amber-400";
  return "bg-red-400";
}

export function formatPercent(val: number) {
  return `${(val * 100).toFixed(1)}%`;
}

export function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const CONDITIONS = [
  { value: "hypertension", label: "Hypertension" },
  { value: "diabetes",     label: "Diabetes" },
  { value: "depression",   label: "Depression" },
  { value: "malaria",      label: "Malaria" },
  { value: "respiratory",  label: "Respiratory" },
];
