"use client";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-1
  className?: string;
  barClassName?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({ value, className, barClassName, label, showValue }: ProgressBarProps) {
  const pct = Math.min(Math.max(value * 100, 0), 100);
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-slate-500">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-slate-700">{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barClassName ?? "bg-teal-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
