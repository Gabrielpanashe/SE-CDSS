"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Status = "checking" | "online" | "offline";

export function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        await api.health();
        if (!cancelled) setStatus("online");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }
    check();
    const interval = setInterval(check, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const label = status === "online" ? "API Online" : status === "offline" ? "API Offline" : "Checking…";
  const dot = cn(
    "h-2 w-2 rounded-full",
    status === "online"   ? "bg-green-500 shadow-[0_0_6px_#22c55e]" :
    status === "offline"  ? "bg-red-500"  : "bg-amber-400 animate-pulse"
  );

  return (
    <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
      <span className={dot} />
      {label}
    </div>
  );
}
