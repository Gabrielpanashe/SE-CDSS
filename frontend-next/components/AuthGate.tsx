"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getRole } from "@/lib/auth";
import { LockKeyhole, LogIn, UserPlus, ShieldAlert } from "lucide-react";

interface AuthGateProps {
  role: "clinician" | "patient";
  children: React.ReactNode;
}

export function AuthGate({ role, children }: AuthGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "unauthenticated" | "redirecting">("loading");

  useEffect(() => {
    if (!isAuthenticated()) {
      setStatus("unauthenticated");
      return;
    }
    const actualRole = getRole();
    if (actualRole !== role) {
      // Wrong role — immediately redirect to their correct portal
      setStatus("redirecting");
      router.replace(actualRole === "clinician" ? "/clinician" : "/patient");
      return;
    }
    setStatus("ok");
  }, [role, router]);

  if (status === "ok") return <>{children}</>;

  // Brief full-screen overlay shown during the redirect (prevents flash of protected content)
  if (status === "redirecting") return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-1">
          <ShieldAlert className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Access Restricted</p>
        <p className="text-xs text-slate-400">Redirecting you to your portal…</p>
        <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mt-1" />
      </div>
    </div>
  );

  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  // Unauthenticated
  const portalLabel = role === "clinician" ? "Clinician Dashboard" : "Patient Portal";

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="card max-w-md w-full text-center space-y-6 py-12 px-8">

        <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <LockKeyhole className="h-8 w-8 text-blue-500" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{portalLabel}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You need to be signed in to access this portal.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/login?next=/${role}`}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href={`/register?next=/${role}`}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          {role === "clinician"
            ? "This portal is restricted to registered clinicians."
            : "This portal is for registered patients."}
        </p>
      </div>
    </div>
  );
}
