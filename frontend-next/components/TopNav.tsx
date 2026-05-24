"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getEmail, getRole, getDisplayName } from "@/lib/auth";
import { api } from "@/lib/api";
import { NavDrawer } from "@/components/NavDrawer";
import { Menu, Activity, Bell, Phone } from "lucide-react";

const NAV_LINKS = [
  { href: "/",             label: "Home"                },
  { href: "/patient",      label: "Patient Portal"      },
  { href: "/clinician",    label: "Clinician Dashboard" },
  { href: "/how-it-works", label: "How It Works"        },
  { href: "/about",        label: "About"               },
];

export function TopNav() {
  const path = usePathname();

  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [email,        setEmail]        = useState<string | null>(null);
  const [role,         setRole]         = useState<string | null>(null);
  const [displayName,  setDisplayName]  = useState<string | null>(null);
  const [unread,       setUnread]       = useState(0);

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
    setDisplayName(getDisplayName());
  }, [path]);

  useEffect(() => {
    if (!getRole()) return;
    api.getNotifications()
      .then((items) => setUnread(items.length))
      .catch(() => setUnread(0));
  }, [path]);

  // Only show user badge on portal pages
  const isPortalPage = path.startsWith("/patient") || path.startsWith("/clinician");

  return (
    <>
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header className={cn(
        "fixed top-0 left-0 right-0 z-30 h-16",
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
        "border-b border-slate-200/80 dark:border-slate-700/60",
        "transition-colors duration-200"
      )}>
        <div className="h-full mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* LEFT: hamburger + brand */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="flex h-9 w-9 items-center justify-center rounded-lg
                text-slate-600 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-extrabold text-slate-900 dark:text-slate-50 text-sm leading-tight tracking-tight">
                  SE&#8209;CDSS
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">
                  Precision Medicine
                </p>
              </div>
            </Link>
          </div>

          {/* CENTRE: navigation links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors duration-150",
                    active
                      ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: notification bell + user badge (portal only) + CTA */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Notification bell — only when logged in */}
            {email && (
              <button
                title={unread > 0 ? `${unread} unread` : "No notifications"}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg
                  text-slate-500 dark:text-slate-400
                  hover:text-slate-800 dark:hover:text-slate-100
                  hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center
                    rounded-full bg-blue-600 text-[8px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            )}

            {/* User badge — only on /patient and /clinician pages */}
            {email && isPortalPage && (
              <div className="hidden md:flex items-center gap-2 rounded-xl
                border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                px-2.5 py-1.5 max-w-[200px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                  bg-blue-600 text-[9px] font-bold text-white uppercase">
                  {(displayName ?? email).charAt(0)}
                </span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                  {displayName ?? email}
                </span>
                {role && (
                  <span className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                    role === "clinician"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  )}>
                    {role}
                  </span>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Contact Us CTA */}
            <Link
              href="/contact"
              className="flex items-center gap-1.5 rounded-lg
                bg-slate-900 dark:bg-slate-50
                hover:bg-slate-700 dark:hover:bg-white
                text-white dark:text-slate-900
                font-semibold text-xs uppercase tracking-wide
                px-4 py-2 transition-colors shadow-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              Contact Us
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
