"use client";
import { usePathname } from "next/navigation";
import { Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getEmail, getRole } from "@/lib/auth";
import { api } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

/* ── Page meta ──────────────────────────────────────────────────── */
const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/":             { title: "Overview",             sub: "System home" },
  "/patient":      { title: "Patient Portal",       sub: "Submit and track medication feedback" },
  "/clinician":    { title: "Clinician Dashboard",  sub: "Monitor patients and generate recommendations" },
  "/how-it-works": { title: "How It Works",         sub: "System architecture and processing pipeline" },
  "/about":        { title: "About",                sub: "Project and team information" },
  "/login":        { title: "Sign In",              sub: "Access your SE-CDSS account" },
  "/register":     { title: "Create Account",       sub: "Register as patient or clinician" },
};

/* ── Component ──────────────────────────────────────────────────── */
export function Topbar() {
  const path        = usePathname();
  const { theme, toggle } = useTheme();
  const isDark      = theme === "dark";

  const [email,     setEmail]     = useState<string | null>(null);
  const [role,      setRole]      = useState<string | null>(null);
  const [unread,    setUnread]    = useState(0);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  /* Re-read auth on every navigation */
  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
  }, [path]);

  /* Unread notification count */
  useEffect(() => {
    if (!getRole()) return;
    api.getNotifications()
      .then((items) => setUnread(items.length))
      .catch(() => setUnread(0));
  }, [path]);

  /* API health ping (once on mount, re-checked every 30 s) */
  useEffect(() => {
    let cancelled = false;
    function ping() {
      api.health()
        .then(() => { if (!cancelled) setApiOnline(true); })
        .catch(() => { if (!cancelled) setApiOnline(false); });
    }
    ping();
    const id = setInterval(ping, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const page = PAGE_META[path] ?? {
    title: path.replace("/", "").replace(/-/g, " ") || "Home",
    sub:   "",
  };

  return (
    <header
      className="fixed top-0 left-56 right-0 z-30 h-14 flex items-center justify-between gap-4
        border-b border-slate-200/80 dark:border-slate-700/60
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm
        px-6 transition-colors duration-200"
    >
      {/* Left — page title */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate leading-tight">
          {page.title}
        </p>
        {page.sub && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-snug">
            {page.sub}
          </p>
        )}
      </div>

      {/* Right — utility actions */}
      <div className="flex items-center gap-1 shrink-0">

        {/* API status pill */}
        {apiOnline !== null && (
          <div className={cn(
            "hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
            apiOnline
              ? "border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          )}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              apiOnline ? "bg-green-500" : "bg-red-500"
            )} />
            {apiOnline ? "API Online" : "API Offline"}
          </div>
        )}

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Notification bell */}
        <button
          title={unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "No new notifications"}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg
            text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100
            hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center
              rounded-full bg-blue-600 text-[9px] font-bold text-white leading-none shadow">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* Theme toggle — icon-only */}
        <button
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-8 w-8 items-center justify-center rounded-lg
            text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100
            hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
        >
          {isDark
            ? <Sun  className="h-4 w-4 text-amber-400" />
            : <Moon className="h-4 w-4" />
          }
        </button>

        {/* User badge — shown when authenticated */}
        {email && (
          <>
            <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
            <div className="hidden md:flex items-center gap-2 rounded-xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              px-2.5 py-1.5 max-w-[220px]">
              {/* Avatar initial */}
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                bg-blue-600 text-[10px] font-bold text-white uppercase">
                {email.charAt(0)}
              </span>
              {/* Email */}
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                {email}
              </span>
              {/* Role badge */}
              {role && (
                <span className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  role === "clinician"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                )}>
                  {role}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
