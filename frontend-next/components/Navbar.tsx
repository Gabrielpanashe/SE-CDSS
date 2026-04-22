"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, Stethoscope, Home } from "lucide-react";

const links = [
  { href: "/",           label: "Home",      icon: Home },
  { href: "/patient",    label: "Patient Portal",    icon: Activity },
  { href: "/clinician",  label: "Clinician Dashboard", icon: Stethoscope },
];

export function Navbar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand shadow">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-navy text-base tracking-tight">SE&#8209;CDSS</span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium mt-0.5">Precision Medicine</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                path === href
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:text-navy hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
