"use client";
import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <p className="text-xs text-amber-800 leading-relaxed">{text}</p>
    </div>
  );
}
