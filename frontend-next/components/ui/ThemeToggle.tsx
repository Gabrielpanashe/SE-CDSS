"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        "border border-slate-200 dark:border-slate-600",
        "bg-slate-50 dark:bg-slate-700/60",
        "text-slate-600 dark:text-slate-300",
        "hover:bg-slate-100 dark:hover:bg-slate-700",
        className
      )}
    >
      {/* Track */}
      <div className={cn(
        "relative h-5 w-9 rounded-full transition-colors duration-300 shrink-0",
        isDark ? "bg-teal-500" : "bg-slate-200"
      )}>
        <span className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300",
          isDark && "translate-x-4"
        )} />
      </div>
      <span className="flex items-center gap-1.5">
        {isDark
          ? <><Moon className="h-3.5 w-3.5 text-teal-400" /> Dark mode</>
          : <><Sun className="h-3.5 w-3.5 text-amber-500" /> Light mode</>
        }
      </span>
    </button>
  );
}
