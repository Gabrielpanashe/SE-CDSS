"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAuthenticated, getRole } from "@/lib/auth";
import { LockKeyhole, LogIn, UserPlus, ShieldAlert } from "lucide-react";

interface AuthGateProps {
  role: "clinician" | "patient";
  children: React.ReactNode;
}

export function AuthGate({ role, children }: AuthGateProps) {
  const [status, setStatus] = useState<"loading" | "ok" | "unauthenticated" | "wrong-role">("loading");

  useEffect(() => {
    if (!isAuthenticated()) {
      setStatus("unauthenticated");
    } else if (getRole() !== role) {
      setStatus("wrong-role");
    } else {
      setStatus("ok");
    }
  }, [role]);

  if (status === "loading") return null;
  if (status === "ok") return <>{children}</>;

  const portalLabel = role === "clinician" ? "Clinician Dashboard" : "Patient Portal";
  const currentRole = getRole();

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="card max-w-md w-full text-center space-y-6 py-12 px-8">

        {/* Icon */}
        <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          {status === "wrong-role"
            ? <ShieldAlert className="h-8 w-8 text-amber-500" />
            : <LockKeyhole className="h-8 w-8 text-teal-500" />
          }
        </div>

        {/* Message */}
        {status === "unauthenticated" ? (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-navy dark:text-white">{portalLabel}</h2>
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
          </>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-navy dark:text-white">Wrong Role</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You are signed in as a{" "}
                <span className="font-semibold text-amber-600 capitalize">{currentRole}</span>.
                The {portalLabel} is only accessible to{" "}
                <span className="font-semibold capitalize">{role}s</span>.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/login?next=/${role}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In as a {role === "clinician" ? "Clinician" : "Patient"}
              </Link>
              <Link
                href={role === "clinician" ? "/patient" : "/clinician"}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                Go to {role === "clinician" ? "Patient Portal" : "Clinician Dashboard"}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
