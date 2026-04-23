"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BackendStatus } from "@/components/ui/StatusDot";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Activity, Stethoscope, Home, Info, Workflow,
  Database, Brain, FlaskConical, Pill,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/",             label: "Home",                icon: Home },
  { href: "/patient",      label: "Patient Portal",      icon: Activity },
  { href: "/clinician",    label: "Clinician Dashboard", icon: Stethoscope },
  { href: "/how-it-works", label: "How It Works",        icon: Workflow },
  { href: "/about",        label: "About",               icon: Info },
];

const STATS = [
  { icon: Database,     value: "215,063", label: "Drug Reviews" },
  { icon: Brain,        value: "108.3M",  label: "BioBERT Params" },
  { icon: FlaskConical, value: "5",       label: "Conditions" },
  { icon: Pill,         value: "25",      label: "Drugs" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col
      border-r border-slate-200/80 dark:border-slate-700/60
      bg-white dark:bg-slate-800
      transition-colors duration-200">

      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3
        border-b border-slate-100 dark:border-slate-700 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-md">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-navy dark:text-slate-100 text-sm leading-tight tracking-tight">
            SE&#8209;CDSS
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Precision Medicine</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Navigation
        </p>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-navy dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-400 dark:text-slate-500")} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Stats */}
      <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          System Scale
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-700/60
              border border-slate-100 dark:border-slate-700 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className="h-3 w-3 text-teal-500" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{label}</span>
              </div>
              <p className="text-base font-extrabold text-navy dark:text-slate-100 tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Theme toggle + backend status */}
      <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3 space-y-2">
        <ThemeToggle />
        <BackendStatus />
      </div>
    </aside>
  );
}
