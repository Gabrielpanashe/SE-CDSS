"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getEmail, getRole, logout } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import {
  X, Home, Activity, Stethoscope, Workflow, Info,
  Phone, Sun, Moon, LogIn, LogOut, ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/",             label: "Home",                 icon: Home,        desc: "System overview"                  },
  { href: "/patient",      label: "Patient Portal",       icon: Activity,    desc: "Submit medication feedback"        },
  { href: "/clinician",    label: "Clinician Dashboard",  icon: Stethoscope, desc: "Monitor patients & recommendations"},
  { href: "/how-it-works", label: "How It Works",         icon: Workflow,    desc: "See the pipeline in detail"        },
  { href: "/about",        label: "About",                icon: Info,        desc: "Project and technology overview"   },
  { href: "/contact",      label: "Contact Us",           icon: Phone,       desc: "Get in touch with the team"        },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NavDrawer({ open, onClose }: Props) {
  const path   = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [role,  setRole]  = useState<string | null>(null);

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
  }, [path, open]);

  /* Close on route change */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onClose(); }, [path]);

  /* Lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleLogout() {
    logout();
    onClose();
    router.push("/");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer panel */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 flex flex-col",
        "bg-white dark:bg-slate-900",
        "border-r border-slate-200 dark:border-slate-700",
        "shadow-2xl transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-slate-50 text-sm leading-tight">SE&#8209;CDSS</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Precision Medicine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Navigation
          </p>
          {NAV_LINKS.map(({ href, label, icon: Icon, desc }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150",
                  active
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  active ? "bg-blue-600 shadow-sm" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                )}>
                  <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-semibold leading-tight",
                    active ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"
                  )}>{label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{desc}</p>
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform",
                  active ? "text-blue-400" : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
              text-slate-700 dark:text-slate-200
              hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            {theme === "dark"
              ? <Sun  className="h-4 w-4 text-amber-400" />
              : <Moon className="h-4 w-4 text-slate-500" />}
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>

        {/* User section */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4">
          {email ? (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white uppercase">
                {email.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{email}</p>
                <span className={cn(
                  "inline-block text-[10px] font-bold capitalize rounded-full px-1.5 py-0.5 mt-0.5",
                  role === "clinician"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                )}>
                  {role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 text-sm transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
