"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, UserPlus } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<"patient" | "clinician">("patient");
  const [patientId, setPatientId] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    setNextPath(next);
    // Pre-select role based on which portal the user came from
    if (next === "/clinician") setRole("clinician");
    else if (next === "/patient") setRole("patient");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          patient_id: role === "patient" && patientId ? patientId : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Registration failed.");
      }
      // Send back to login, preserving the intended destination
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-lg mb-4">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-slate-100">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">SE-CDSS Precision Medicine</p>
        </div>

        {/* Destination hint */}
        {nextPath && (
          <p className="text-center text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20
            border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-2.5 mb-6 capitalize">
            Create an account to access the{" "}
            <strong>{nextPath.replace("/", "")} portal</strong>
          </p>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm
                  text-slate-900 dark:text-slate-100 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm
                  text-slate-900 dark:text-slate-100 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["patient", "clinician"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border py-2.5 text-sm font-medium capitalize transition-all
                      ${role === r
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                        : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {role === "patient" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Patient ID <span className="text-slate-400 font-normal">(optional — e.g. P-00001)</span>
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  pattern="P-\d{5}"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600
                    bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm
                    text-slate-900 dark:text-slate-100 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="P-00001"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20
                rounded-xl px-4 py-2.5 border border-red-100 dark:border-red-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl
                gradient-brand text-white font-semibold py-2.5 text-sm
                shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href={loginHref} className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
