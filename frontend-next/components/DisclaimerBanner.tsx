"use client";
import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{text}</p>
    </div>
  );
}
