"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getEmail, getRole, logout } from "@/lib/auth";
import {
  Activity, Stethoscope, Home, Info, Workflow,
  Database, Brain, FlaskConical, Pill, LogOut, LogIn,
} from "lucide-react";

/* ── Navigation items ───────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "/",             label: "Home",                icon: Home },
  { href: "/patient",      label: "Patient Portal",      icon: Activity },
  { href: "/clinician",    label: "Clinician Dashboard", icon: Stethoscope },
  { href: "/how-it-works", label: "How It Works",        icon: Workflow },
  { href: "/about",        label: "About",               icon: Info },
];

/* ── Quick stats ─────────────────────────────────────────────────── */
const STATS = [
  { icon: Database,     value: "215 k", label: "Drug Reviews" },
  { icon: Brain,        value: "108 M", label: "BioBERT Params" },
  { icon: FlaskConical, value: "5",     label: "Conditions" },
  { icon: Pill,         value: "25",    label: "Drugs" },
];

/* ── Component ───────────────────────────────────────────────────── */
export function Sidebar() {
  const path   = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role,  setRole]  = useState<string | null>(null);

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
  }, [path]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col
      border-r border-slate-200/80 dark:border-slate-700/60
      bg-white dark:bg-slate-900
      transition-colors duration-200">

      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center gap-3
        border-b border-slate-100 dark:border-slate-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand shadow-sm">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-slate-900 dark:text-slate-50 text-sm leading-tight tracking-tight">
            SE&#8209;CDSS
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
            Precision Medicine
          </p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest
          text-slate-400 dark:text-slate-600">
          Menu
        </p>

        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                "transition-all duration-150",
                active
                  ? [
                      "border-l-2 border-blue-600",
                      "bg-blue-50 dark:bg-blue-900/20",
                      "text-blue-700 dark:text-blue-300",
                      "pl-[10px]",   // compensate for the border so text stays aligned
                    ]
                  : [
                      "border-l-2 border-transparent",
                      "text-slate-600 dark:text-slate-400",
                      "hover:bg-slate-50 dark:hover:bg-slate-800/60",
                      "hover:text-slate-900 dark:hover:text-slate-100",
                      "pl-[10px]",
                    ]
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
              )} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── System stats ──────────────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest
          text-slate-400 dark:text-slate-600 px-1">
          System Scale
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label}
              className="rounded-lg bg-slate-50 dark:bg-slate-800/60
                border border-slate-100 dark:border-slate-700/60
                px-2.5 py-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Icon className="h-3 w-3 text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                  {label}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── User section ──────────────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3">
        {email ? (
          <div className="flex items-center gap-2">
            {/* Avatar initial */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
              bg-blue-600 text-[11px] font-bold text-white uppercase">
              {email.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {email}
              </p>
              <p className={cn(
                "text-[10px] font-semibold capitalize",
                role === "clinician"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}>
                {role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 rounded-lg p-1.5
                text-slate-400 hover:text-red-500 hover:bg-red-50
                dark:hover:bg-red-900/20 dark:hover:text-red-400
                transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
              text-slate-600 dark:text-slate-400
              hover:bg-slate-50 dark:hover:bg-slate-800/60
              hover:text-slate-900 dark:hover:text-slate-100
              transition-colors"
          >
            <LogIn className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
