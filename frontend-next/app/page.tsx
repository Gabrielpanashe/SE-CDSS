import Link from "next/link";
import Image from "next/image";
import {
  Stethoscope, Brain, Shield, TrendingUp,
  ArrowRight, Heart, UserCheck, CheckCircle,
} from "lucide-react";

const conditions = [
  { name: "Hypertension", drugs: "Amlodipine · Lisinopril · Losartan",             accent: "border-l-red-400",    dot: "bg-red-400"    },
  { name: "Diabetes",     drugs: "Metformin · Insulin Glargine · Empagliflozin",   accent: "border-l-blue-400",   dot: "bg-blue-400"   },
  { name: "Depression",   drugs: "Escitalopram · Sertraline · Venlafaxine",        accent: "border-l-purple-400", dot: "bg-purple-400" },
  { name: "Malaria",      drugs: "Artemether-Lumefantrine · Quinine · Atovaquone", accent: "border-l-amber-400",  dot: "bg-amber-400"  },
  { name: "Respiratory",  drugs: "Salbutamol · Azithromycin · Amoxicillin",        accent: "border-l-green-400",  dot: "bg-green-400"  },
];

export default function HomePage() {
  return (
    <div className="space-y-20">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">

          {/* Left — text */}
          <div>
            {/* aidoc-style vertical accent bar */}
            <div className="border-l-4 border-blue-600 pl-5 mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                Smarter medication<br />
                decisions.<br />
                <span className="text-blue-700 dark:text-blue-400">Powered by AI.</span>
              </h1>
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-md">
              SE-CDSS turns patient medication feedback into clinical action — classifying sentiment,
              assessing risk, and ranking personalised drug alternatives in real time.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/login?next=/patient"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-700 dark:hover:bg-blue-700 text-white font-semibold px-7 py-3.5 text-sm transition-colors shadow-md">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login?next=/clinician"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400 text-slate-700 dark:text-slate-200 font-semibold px-7 py-3.5 text-sm transition-colors">
                <Stethoscope className="h-4 w-4" />
                Clinician Dashboard
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Powered by BioBERT · Real-time Clinical Intelligence
            </div>
          </div>

          {/* Right — image card */}
          <div className="relative hidden lg:block">
            <div className="relative h-[440px] rounded-2xl overflow-hidden shadow-card-hover ring-1 ring-slate-200 dark:ring-slate-700">
              <Image
                src="/images/custom/hero_section.jpg"
                alt="Clinical environment"
                fill
                sizes="50vw"
                className="object-cover object-center"
                priority
              />
            </div>
            {/* floating stat pill */}
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card px-4 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">0.802 F1 Score</p>
                <p className="text-[10px] text-slate-400">BioBERT · 215k reviews</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CORE FEATURES ─────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="section-title">Clinical Intelligence, End to End</h2>
          <p className="section-subtitle mt-2 max-w-xl mx-auto">
            Three modules that work in concert on every submission — from raw patient language to ranked clinical action.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sentiment Analysis */}
          <div className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="/images/custom/sentimentanalysis.jpg"
                alt="AI sentiment analysis"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base mb-2">Sentiment Analysis</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                BioBERT reads each patient review and classifies it as Positive, Neutral, or Negative —
                with a confidence score. Understands clinical language that general AI models miss.
              </p>
              <ul className="mt-3 space-y-1.5">
                {["3-class classification", "87%+ confidence accuracy", "Clinical language aware"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* EHR Integration */}
          <div className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="/images/custom/ehrintegration.jpg"
                alt="Electronic Health Record integration"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base mb-2">Risk Assessment & EHR</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Sentiment is cross-referenced against the patient&apos;s Electronic Health Record —
                allergies, current medications, and condition profile — to assess clinical risk level.
              </p>
              <ul className="mt-3 space-y-1.5">
                {["Mild · Moderate · Severe classification", "Adverse keyword override", "Patient history aware"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Drug Recommendations */}
          <div className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="/images/custom/drugrecommendation.jpg"
                alt="Drug recommendations"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base mb-2">Drug Recommendations</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                The top 3 alternative medications are ranked using a weighted scoring formula combining
                clinical guidelines, EHR profile compatibility, and patient sentiment signals.
              </p>
              <ul className="mt-3 space-y-1.5">
                {["Guideline + EHR + Sentiment scoring", "Top 3 ranked alternatives", "Condition-specific results"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTAL SELECTION ──────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="section-title">Choose Your Portal</h2>
          <p className="section-subtitle mt-2">Two tailored interfaces — one for patients, one for clinicians.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Patient */}
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">Patient Portal</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Submit feedback · view your analysis</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Describe how your medication is making you feel. The system analyses your feedback,
              flags any risks, and shows you a personalised list of alternatives your care team can discuss with you.
            </p>
            <div className="space-y-2 mb-6">
              {[
                "Instant sentiment and risk analysis",
                "Personalised drug alternatives",
                "Secure · private · no medical knowledge needed.",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/login?next=/patient"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors">
              <UserCheck className="h-4 w-4" />
              Open Patient Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Clinician */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 dark:bg-slate-600 shadow-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">Clinician Dashboard</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitor patients · guide treatment</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Look up any patient to see their complete medication sentiment history, risk trend charts,
              and ranked drug recommendations filtered by their EHR profile and condition.
            </p>
            <div className="space-y-2 mb-6">
              {[
                "Patient sentiment trend monitoring",
                "Evidence-based drug ranking",
                "Secure messaging to patients",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/login?next=/clinician"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-600 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors">
              <Stethoscope className="h-4 w-4" />
              Open Clinician Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SUPPORTED CONDITIONS ──────────────────────────── */}
      <section>
        <div className="text-center mb-6">
          <h2 className="section-title mb-1">Supported Conditions</h2>
          <p className="section-subtitle">5 therapeutic areas · 25 evidence-based drugs · top 3 ranked alternatives per patient</p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map(({ name, drugs, accent, dot }) => (
            <div key={name}
              className={`rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 border-l-4 ${accent} hover:shadow-card transition-shadow`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                <p className="font-bold text-slate-900 dark:text-slate-50 text-sm">{name}</p>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded px-1.5 py-0.5">
                  3 drugs
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed pl-4">{drugs}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADVISORY DISCLAIMER ───────────────────────────── */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 px-5 py-4">
        <Heart className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>SE-CDSS is a decision-support tool, not a prescribing system.</strong>{" "}
          All analysis and recommendations are advisory and must be reviewed by a qualified healthcare professional
          before any clinical action is taken.
        </p>
      </div>

    </div>
  );
}
