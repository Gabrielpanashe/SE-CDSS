import Link from "next/link";
import Image from "next/image";
import {
  Activity, Stethoscope, Brain, Shield, TrendingUp, Clock,
  ArrowRight, Heart, UserCheck, ChevronRight,
} from "lucide-react";
import { HeroStats } from "@/components/HeroStats";

/* ── Feature cards ─────────────────────────────────────────── */
const features = [
  {
    step: "01",
    icon: Brain,
    title: "Sentiment Analysis",
    desc: "Your medication feedback is analysed by a biomedical AI model that understands clinical language — not just keywords.",
    hoverBg: "hover:bg-blue-600",
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
    hoverBg: "hover:bg-slate-700",
  },
  {
    step: "04",
    icon: Clock,
    title: "Trend Monitoring",
    desc: "Clinicians can track how a patient's sentiment changes over time and spot warning signs before they escalate.",
    hoverBg: "hover:bg-purple-600",
  },
];

/* ── Pipeline steps ────────────────────────────────────────── */
const pipeline = [
  { num: 1, label: "Submit Review",       color: "bg-blue-600"   },
  { num: 2, label: "AI Reads Text",       color: "bg-purple-600" },
  { num: 3, label: "Sentiment Classified",color: "bg-indigo-600" },
  { num: 4, label: "Risk Assessed",       color: "bg-red-500"    },
  { num: 5, label: "Drugs Ranked",        color: "bg-emerald-600"},
];

/* ── Conditions ────────────────────────────────────────────── */
const conditions = [
  { name: "Hypertension", drugs: "Amlodipine · Lisinopril · Losartan",              accent: "border-l-red-400",    dot: "bg-red-400"    },
  { name: "Diabetes",     drugs: "Metformin · Insulin Glargine · Empagliflozin",    accent: "border-l-blue-400",   dot: "bg-blue-400"   },
  { name: "Depression",   drugs: "Escitalopram · Sertraline · Venlafaxine",         accent: "border-l-purple-400", dot: "bg-purple-400" },
  { name: "Malaria",      drugs: "Artemether-Lumefantrine · Quinine · Atovaquone",  accent: "border-l-amber-400",  dot: "bg-amber-400"  },
  { name: "Respiratory",  drugs: "Salbutamol · Azithromycin · Amoxicillin",         accent: "border-l-green-400",  dot: "bg-green-400"  },
];

export default function HomePage() {
  return (
    <div className="space-y-14">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl gradient-brand px-8 pt-8 pb-10 text-white shadow-card">
        {/* Background radial glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 75% 30%, white 0%, transparent 60%)" }} />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] items-center">
          {/* Left: brand mark + headline + CTAs */}
          <div>
            <div className="flex items-center gap-2.5 mb-7">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-white text-sm leading-tight tracking-tight">SE&#8209;CDSS</p>
                <p className="text-[10px] text-white/50 font-medium">Chinhoyi University of Technology · 2026</p>
              </div>
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
              Clinical Decision Support · Powered by BioBERT
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight tracking-tight mb-4">
              Your medication feedback,<br />
              <span className="text-blue-200">turned into clinical insight.</span>
            </h1>

            <p className="text-sm text-blue-100 leading-relaxed mb-8 max-w-lg">
              Describe how your medication is making you feel. SE-CDSS analyses your words,
              flags anything that needs attention, and helps your care team find a better match — faster.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/login?next=/patient"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-800 font-semibold px-5 py-2.5 text-sm hover:bg-blue-50 transition-colors shadow">
                <Activity className="h-4 w-4 text-blue-600" />
                I&apos;m a Patient
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/login?next=/clinician"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 text-white font-semibold px-5 py-2.5 text-sm hover:bg-white/25 transition-colors backdrop-blur-sm border border-white/20">
                <Stethoscope className="h-4 w-4" />
                I&apos;m a Clinician
              </Link>
            </div>

            <p className="mt-8 text-[10px] text-white/30 font-medium tracking-wide">
              Precision Medicine · BECE Final Year Project · Dissertation 2026
            </p>
          </div>

          {/* Right: Key stats panel */}
          <div className="hidden lg:flex flex-col gap-3 min-w-[220px]">
            {[
              { value: "0.802", label: "BioBERT F1 Score",   sub: "Weighted F1 on test set" },
              { value: "215k",  label: "Training Reviews",   sub: "UCI Drug Review Dataset" },
              { value: "50",    label: "Simulated Patients", sub: "Synthetic EHR profiles"  },
              { value: "25",    label: "Drugs in Base",      sub: "5 conditions covered"     },
            ].map(({ value, label, sub }) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-5 py-3.5">
                <p className="text-2xl font-extrabold text-white tabular-nums">{value}</p>
                <p className="text-sm font-semibold text-white/80 mt-0.5">{label}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section>
        <HeroStats />
      </section>

      {/* ── SYSTEM CAPABILITIES ────────────────────────────── */}
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
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 group-hover:bg-white/20 transition-colors">
                <Icon className="h-6 w-6 text-slate-500 dark:text-slate-300 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-white mb-2 text-sm leading-snug transition-colors">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 leading-relaxed transition-colors">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS pipeline ──────────────────────────── */}
      <section>
        <h2 className="section-title mb-1">How It Works</h2>
        <p className="section-subtitle mb-6">From your words to a clinical recommendation — in seconds.</p>

        {/* Pipeline steps */}
        <div className="flex items-center gap-0 overflow-x-auto pb-3 mb-8">
          {pipeline.map(({ num, label, color }, i) => (
            <div key={label} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color} text-white text-xs font-bold shadow`}>
                  {num}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center max-w-[90px] leading-tight">{label}</span>
              </div>
              {i < pipeline.length - 1 && (
                <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-3 mb-4 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-card">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="ml-2 text-xs font-semibold text-slate-400 dark:text-slate-500">System Architecture — SE-CDSS Block Diagram</span>
          </div>
          <div className="p-4">
            <Image
              src="/images/architecture.png"
              alt="SE-CDSS system architecture block diagram"
              width={900}
              height={450}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 pb-4">
            Figure 3.1 — SE-CDSS architecture: patient input → BioBERT pipeline → risk assessment → EHR matching → recommendations
          </p>
        </div>
      </section>

      {/* ── WHO IS THIS FOR ────────────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* Patient card */}
        <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">For Patients</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400">Share your medication experience</p>
            </div>
          </div>
          <ol className="space-y-3 mb-5">
            {[
              "Describe how your medication is making you feel — side effects, improvements, concerns.",
              "The system analyses your review and flags any clinical risks automatically.",
              "You and your care team receive a ranked list of alternative medications if needed.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Link href="/login?next=/patient"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors">
            <Activity className="h-4 w-4" />
            Go to Patient Portal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Clinician card */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 dark:bg-slate-600 shadow">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">For Clinicians</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monitor patients and guide treatment</p>
            </div>
          </div>
          <ol className="space-y-3 mb-5">
            {[
              "Look up any patient by ID to see their full medication sentiment history.",
              "View risk trend charts — spot deteriorating responses before they become emergencies.",
              "Generate ranked drug recommendations filtered by condition, allergies, and EHR profile.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 dark:bg-slate-500 text-white text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Link href="/login?next=/clinician"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-600 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors">
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
              className={`rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 border-l-4 ${accent} hover:shadow-card transition-shadow`}
            >
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

      {/* ── MODEL PERFORMANCE preview ──────────────────────── */}
      <section>
        <h2 className="section-title mb-1">Model Performance</h2>
        <p className="section-subtitle mb-5">BioBERT fine-tuned on 40,000 drug reviews achieves strong clinical sentiment classification.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">BioBERT Confusion Matrix</p>
            <Image
              src="/images/biobert_confusion.png"
              alt="BioBERT confusion matrix"
              width={480}
              height={360}
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="card">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">Model Comparison</p>
            <Image
              src="/images/model_comparison.png"
              alt="BioBERT vs TF-IDF baseline model comparison"
              width={480}
              height={360}
              className="w-full h-auto rounded-lg"
            />
          </div>
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
