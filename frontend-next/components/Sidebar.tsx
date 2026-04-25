"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getEmail, getRole, logout } from "@/lib/auth";
import { api } from "@/lib/api";
import { BackendStatus } from "@/components/ui/StatusDot";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Activity, Stethoscope, Home, Info, Workflow,
  Database, Brain, FlaskConical, Pill, LogOut, LogIn, Bell,
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
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
  }, [path]);

  useEffect(() => {
    if (!getRole()) return;
    api.getNotifications()
      .then((items) => setUnread(items.length))
      .catch(() => setUnread(0));
  }, [path]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

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
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Navigation
          </p>
          {unread > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white">
              <Bell className="h-2.5 w-2.5" />
              {unread}
            </span>
          )}
        </div>
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

      {/* User section */}
      <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3">
        {email ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-navy dark:text-slate-100 truncate">{email}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50
                dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium
              text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          >
            <LogIn className="h-4 w-4 text-slate-400" />
            Sign in
          </Link>
        )}
      </div>

      {/* Theme toggle + backend status */}
      <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3 space-y-2">
        <ThemeToggle />
        <BackendStatus />
      </div>
    </aside>
  );
}
