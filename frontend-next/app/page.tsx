import Link from "next/link";
import {
  Activity, Stethoscope, Brain, Shield, TrendingUp, Clock,
  ArrowRight, CheckCircle, ChevronRight, Pill, Heart, UserCheck,
} from "lucide-react";

/* ── Feature cards ─────────────────────────────────────────── */
const features = [
  {
    step: "01",
    icon: Brain,
    title: "Sentiment Analysis",
    desc: "Your medication feedback is analysed by a biomedical AI model that understands clinical language — not just keywords.",
    hoverBg: "hover:bg-teal-500",
  },
  {
    step: "02",
    icon: Shield,
    title: "Risk Classification",
    desc: "Every review is automatically assessed and flagged as Mild Concern, Moderate Risk, or Severe Adverse Reaction.",
    hoverBg: "hover:bg-red-500",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Drug Recommendations",
    desc: "Safer alternatives are ranked using clinical guidelines, your health profile, and how similar patients responded.",
    hoverBg: "hover:bg-navy",
  },
  {
    step: "04",
    icon: Clock,
    title: "Trend Monitoring",
    desc: "Clinicians can track how a patient's sentiment changes over time and spot warning signs before they escalate.",
    hoverBg: "hover:bg-purple-500",
  },
];

/* ── Pipeline steps ────────────────────────────────────────── */
const pipeline = [
  { label: "Submit Review" },
  { label: "AI Processes Text" },
  { label: "Sentiment Classified" },
  { label: "Risk Assessed" },
  { label: "Drugs Ranked" },
];

/* ── Conditions ────────────────────────────────────────────── */
const conditions = [
  { name: "Hypertension",  drugs: "Amlodipine · Lisinopril · Losartan",               accent: "border-l-red-400",    dot: "bg-red-400"    },
  { name: "Diabetes",      drugs: "Metformin · Insulin Glargine · Empagliflozin",      accent: "border-l-blue-400",   dot: "bg-blue-400"   },
  { name: "Depression",    drugs: "Escitalopram · Sertraline · Venlafaxine",           accent: "border-l-purple-400", dot: "bg-purple-400" },
  { name: "Malaria",       drugs: "Artemether-Lumefantrine · Quinine · Atovaquone",    accent: "border-l-amber-400",  dot: "bg-amber-400"  },
  { name: "Respiratory",   drugs: "Salbutamol · Azithromycin · Amoxicillin",           accent: "border-l-green-400",  dot: "bg-green-400"  },
];

export default function HomePage() {
  return (
    <div className="space-y-14">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="grid gap-8 lg:grid-cols-[1fr_380px] items-center">
        {/* Left — copy */}
        <div className="relative overflow-hidden rounded-3xl gradient-brand px-8 pt-7 pb-10 text-white shadow-card lg:h-full flex flex-col justify-between">
          {/* Radial glow */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 55%)" }} />

          {/* Top-left brand mark — anchors the hero */}
          <div className="relative flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight tracking-tight">SE&#8209;CDSS</p>
              <p className="text-[10px] text-white/50 font-medium">Chinhoyi University of Technology · 2026</p>
            </div>
          </div>

          {/* Main copy */}
          <div className="relative flex-1 flex flex-col justify-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 animate-pulse" />
              Clinical Decision Support · Powered by BioBERT
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Your medication feedback,<br />
              <span className="text-teal-300">turned into clinical insight.</span>
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed mb-8 max-w-md">
              Describe how your medication is making you feel. SE-CDSS analyses your words,
              flags anything that needs attention, and helps your care team find a better match — faster.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login?next=/patient"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-navy font-semibold px-5 py-2.5 text-sm hover:bg-teal-50 transition-colors shadow">
                <Activity className="h-4 w-4" />
                I&apos;m a Patient
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/login?next=/clinician"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 text-white font-semibold px-5 py-2.5 text-sm hover:bg-white/25 transition-colors backdrop-blur-sm">
                <Stethoscope className="h-4 w-4" />
                I&apos;m a Clinician
              </Link>
            </div>
          </div>

          {/* Bottom-right corner tag */}
          <div className="relative mt-8 flex justify-end">
            <span className="text-[10px] text-white/30 font-medium tracking-wide">
              Precision Medicine · BSIT Final Year Project
            </span>
          </div>
        </div>

        {/* Right — phone mockup wrapping the example card */}
        <div className="flex flex-col items-center gap-3">

          {/* Label above the phone */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-700 px-3 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
              ✦ Example Output
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Not real patient data</span>
          </div>

          {/* Phone outer shell */}
          <div className="relative mx-auto w-[300px]">
            {/* Side volume buttons */}
            <div className="absolute -left-[3px] top-20 w-[3px] h-7 bg-slate-700 dark:bg-slate-600 rounded-l-sm" />
            <div className="absolute -left-[3px] top-32 w-[3px] h-7 bg-slate-700 dark:bg-slate-600 rounded-l-sm" />
            {/* Side power button */}
            <div className="absolute -right-[3px] top-24 w-[3px] h-10 bg-slate-700 dark:bg-slate-600 rounded-r-sm" />

            {/* Phone frame */}
            <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.4rem] p-[10px] shadow-2xl ring-1 ring-white/10">

              {/* Screen */}
              <div className="rounded-[1.8rem] overflow-hidden bg-white dark:bg-slate-800">

                {/* Status bar */}
                <div className="bg-slate-900 dark:bg-slate-950 px-5 pt-3 pb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white/80 tabular-nums">9:41</span>
                  {/* Pill notch */}
                  <div className="h-4 w-16 rounded-full bg-black" />
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-white/70">●●●</span>
                    <span className="text-[9px] text-white/70">WiFi</span>
                    <span className="text-[9px] text-white/70">🔋</span>
                  </div>
                </div>

                {/* App header bar */}
                <div className="bg-teal-500 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-white" />
                    <span className="text-[11px] font-bold text-white">SE-CDSS</span>
                  </div>
                  <span className="text-[9px] text-white/70 bg-white/15 rounded px-1.5 py-0.5">P-00042 · Metformin</span>
                </div>

                {/* Scrollable content */}
                <div className="px-4 py-3 space-y-3 max-h-[480px] overflow-y-auto">

                  {/* Patient review */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Patient Review</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      &ldquo;Blood pressure is finally under control and I have no major side effects. Feeling much more like myself.&rdquo;
                    </p>
                  </div>

                  {/* Sentiment */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Sentiment</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-[12px] font-bold text-green-700 dark:text-green-400">POSITIVE</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">87% conf.</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full w-[87%] rounded-full bg-green-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      {[["Pos","87%","text-green-600"],["Neu","9%","text-amber-500"],["Neg","4%","text-red-500"]].map(([lbl,val,col]) => (
                        <div key={lbl} className="rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 py-1">
                          <p className={`text-[11px] font-bold ${col}`}>{val}</p>
                          <p className="text-[8px] text-slate-400">{lbl}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk */}
                  <div className="flex items-center justify-between rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Risk Level</p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Mild Concern
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 text-right max-w-[80px] leading-tight">No adverse keywords</span>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Top Drug Matches</p>
                    <div className="space-y-1">
                      {[
                        { rank: "1st", drug: "Amlodipine", score: "94%", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
                        { rank: "2nd", drug: "Lisinopril",  score: "87%", bg: "bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700"    },
                        { rank: "3rd", drug: "Losartan",    score: "79%", bg: "bg-orange-50/60 dark:bg-orange-900/20 border-orange-200/60 dark:border-orange-800/40" },
                      ].map(({ rank, drug, score, bg }) => (
                        <div key={drug} className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${bg}`}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400 w-4">{rank}</span>
                            <Pill className="h-2.5 w-2.5 text-slate-400" />
                            <span className="text-[11px] font-semibold text-navy dark:text-slate-200">{drug}</span>
                          </div>
                          <span className="text-[11px] font-bold text-teal-600">{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* App bottom note */}
                <div className="border-t border-teal-100 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 px-4 py-2">
                  <p className="text-[9px] text-teal-700 dark:text-teal-400 font-medium text-center">
                    Advisory only · review with your care team
                  </p>
                </div>

                {/* Home bar */}
                <div className="bg-white dark:bg-slate-800 py-2 flex justify-center">
                  <div className="h-1 w-20 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Label below */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            ↑ This is exactly what you&apos;ll see after submitting your review.
          </p>
        </div>

      </section>

      {/* ── HOW IT WORKS pipeline ──────────────────────────── */}
      <section>
        <h2 className="section-title mb-1">How It Works</h2>
        <p className="section-subtitle mb-6">From your words to a clinical recommendation — in seconds.</p>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {pipeline.map(({ label }, i) => (
            <div key={label} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold shadow">
                  {i + 1}
                </div>
                <span className="text-xs font-semibold text-navy text-center max-w-[80px] leading-tight">{label}</span>
              </div>
              {i < pipeline.length - 1 && (
                <ChevronRight className="h-5 w-5 text-slate-300 mx-2 shrink-0 mb-4" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SYSTEM CAPABILITIES with hover colours ─────────── */}
      <section>
        <h2 className="section-title mb-1">What the System Does</h2>
        <p className="section-subtitle mb-6">Four integrated steps, working together on every submission.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ step, icon: Icon, title, desc, hoverBg }) => (
            <div
              key={title}
              className={`group card card-hover relative cursor-default transition-all duration-200 ${hoverBg} hover:border-transparent hover:shadow-card-hover`}
            >
              <span className="absolute top-4 right-4 text-xs font-bold text-slate-200 group-hover:text-white/30 transition-colors">
                {step}
              </span>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-white/20 transition-colors">
                <Icon className="h-6 w-6 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-navy group-hover:text-white mb-2 text-sm leading-snug transition-colors">
                {title}
              </h3>
              <p className="text-xs text-slate-500 group-hover:text-white/80 leading-relaxed transition-colors">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IS THIS FOR ────────────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* Patient card */}
        <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">For Patients</h3>
              <p className="text-xs text-teal-700">Share your medication experience</p>
            </div>
          </div>
          <ol className="space-y-3 mb-5">
            {[
              "Describe how your medication is making you feel — side effects, improvements, concerns.",
              "The system analyses your review and flags any clinical risks automatically.",
              "You and your care team receive a ranked list of alternative medications if needed.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Link href="/login?next=/patient"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 text-white font-semibold px-5 py-2.5 text-sm hover:bg-teal-600 transition-colors">
            <Activity className="h-4 w-4" />
            Go to Patient Portal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Clinician card */}
        <div className="rounded-2xl border-2 border-navy/20 bg-navy/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy shadow">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">For Clinicians</h3>
              <p className="text-xs text-navy/60">Monitor patients and guide treatment</p>
            </div>
          </div>
          <ol className="space-y-3 mb-5">
            {[
              "Look up any patient by ID to see their full medication sentiment history.",
              "View risk trend charts — spot deteriorating responses before they become emergencies.",
              "Generate ranked drug recommendations filtered by condition, allergies, and EHR profile.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Link href="/login?next=/clinician"
            className="inline-flex items-center gap-2 rounded-xl bg-navy text-white font-semibold px-5 py-2.5 text-sm hover:bg-navy-800 transition-colors">
            <Stethoscope className="h-4 w-4" />
            Go to Clinician Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── SUPPORTED CONDITIONS ───────────────────────────── */}
      <section>
        <h2 className="section-title mb-1">Supported Conditions</h2>
        <p className="section-subtitle mb-5">5 conditions covered · 25 drugs in the evidence base · 3 alternatives per recommendation</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map(({ name, drugs, accent, dot }) => (
            <div
              key={name}
              className={`rounded-xl border border-slate-100 bg-white px-4 py-3.5 border-l-4 ${accent} hover:shadow-card transition-shadow`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                <p className="font-bold text-navy text-sm">{name}</p>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                  3 drugs
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-4">{drugs}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADVISORY DISCLAIMER ───────────────────────────── */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Heart className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>SE-CDSS is a decision-support tool, not a prescribing system.</strong>{" "}
          All analysis and recommendations are advisory and must be reviewed by a qualified healthcare professional
          before any clinical action is taken.
        </p>
      </div>

    </div>
  );
}
