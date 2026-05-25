"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Activity, UserPlus, Eye, EyeOff, UserCheck, Stethoscope } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [role, setRole]                 = useState<"patient" | "clinician">("patient");
  const [patientId, setPatientId]       = useState("");
  const [displayName, setDisplayName]   = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [nextPath, setNextPath]         = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    setNextPath(next);
    if (next === "/clinician") setRole("clinician");
    else if (next === "/patient") setRole("patient");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          patient_id: role === "patient" && patientId ? patientId : null,
          display_name: role === "clinician" && displayName ? displayName : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Registration failed.");
      }
      const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
      router.push(loginHref);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-card-hover border border-slate-200 dark:border-slate-700">

        {/* Left — decorative image panel */}
        <div className="relative hidden lg:flex flex-col justify-center min-h-[560px] overflow-hidden">
          <Image
            src="/images/custom/patient_signupbackground.jpg"
            alt="Healthcare background"
            fill
            sizes="50vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/60 to-slate-900/30" />
          <div className="relative z-10 p-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <p className="font-extrabold text-white text-sm">SE&#8209;CDSS</p>
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
              Your health story<br />starts here.
            </h2>
            <p className="text-sm text-slate-300 max-w-xs leading-relaxed mb-6">
              Create your account for personalised medication analysis, risk assessment, and clinical recommendations.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Secure · Private · No medical knowledge needed
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="bg-white dark:bg-slate-900 px-8 py-10 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            {/* Mobile brand */}
            <div className="flex items-center gap-2.5 mb-7 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">SE&#8209;CDSS</p>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mb-1">Create your account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">Join SE-CDSS — takes less than a minute</p>

            {nextPath && (
              <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 mb-5 capitalize">
                Create an account to access the <strong>{nextPath.replace("/", "")} portal</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  I am a…
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "patient",   label: "Patient",   icon: UserCheck },
                    { value: "clinician", label: "Clinician", icon: Stethoscope },
                  ] as const).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all
                        ${role === value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {role === "clinician" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full name <span className="text-slate-400 font-normal">(e.g. Dr John Smith)</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Dr John Smith"
                  />
                </div>
              )}

              {role === "patient" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Patient ID <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    pattern="P-\d{5}"
                    className="input-field"
                    placeholder="P-00001"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                    Links your account to an existing EHR profile
                  </p>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2.5 border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-1"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href={loginHref} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
