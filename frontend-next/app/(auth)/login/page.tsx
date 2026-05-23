"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Activity, LogIn, Eye, EyeOff } from "lucide-react";
import { setAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [nextPath, setNextPath]   = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Login failed.");
      }
      const data = await res.json();
      setAuth(data.access_token, data.role, data.email, data.patient_id);
      const roleDefault = data.role === "clinician" ? "/clinician" : "/patient";
      router.push(nextPath ?? roleDefault);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register";

  return (
    <div className="min-h-screen flex">
      {/* Left — image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end overflow-hidden">
        <Image
          src="/images/custom/login_background.jpg"
          alt="Clinical setting"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        <div className="relative z-10 p-10 pb-12">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <p className="font-extrabold text-white text-sm">SE&#8209;CDSS</p>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-2">
            Clinical decision support<br />at your fingertips.
          </h2>
          <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
            AI-powered medication sentiment analysis and personalised drug recommendations for patients and clinicians.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <p className="font-extrabold text-slate-900 dark:text-white text-base">SE&#8209;CDSS</p>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">Sign in to your SE-CDSS account</p>

          {nextPath && (
            <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 mb-6 capitalize">
              Sign in to access the <strong>{nextPath.replace("/", "")} portal</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2.5 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No account?{" "}
            <Link href={registerHref} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
