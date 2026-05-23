import Image from "next/image";
import { Brain, Database, Server, Globe, FlaskConical, GitBranch, ShieldCheck, TrendingUp, Activity } from "lucide-react";

const stack = [
  { icon: Brain,        label: "BioBERT",     desc: "dmis-lab/biobert-base-cased-v1.2 · 108.3M parameters · fine-tuned for 3-class clinical sentiment", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300" },
  { icon: Server,       label: "FastAPI",      desc: "Python 3.12 · async REST API · Pydantic validation · JWT authentication",                          color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300"           },
  { icon: Database,     label: "PostgreSQL",   desc: "SQLAlchemy ORM · 3 core tables: PredictionLog, PatientFeedback, Recommendation",                   color: "bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"          },
  { icon: Globe,        label: "Next.js 14",   desc: "TypeScript · Tailwind CSS · App Router · Role-based patient and clinician portals",                 color: "bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"          },
  { icon: FlaskConical, label: "scikit-learn", desc: "TF-IDF vectorisation + Logistic Regression baseline · LIME model-agnostic explainability",          color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300"       },
];

const highlights = [
  { icon: Brain,      title: "BioBERT Intelligence",      desc: "A biomedical language model fine-tuned on 215,000 real drug reviews — built for clinical language.",   color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20" },
  { icon: ShieldCheck,title: "Clinical Risk Assessment",  desc: "Adverse keyword detection combined with sentiment creates a 3-tier risk classification system.",       color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"           },
  { icon: TrendingUp, title: "Evidence-Based Scoring",    desc: "Drug recommendations weighted equally by clinical guidelines, EHR profile, and patient sentiment.",   color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
  { icon: Activity,   title: "Real-time Analysis",        desc: "From text submission to ranked recommendations in under 3 seconds on standard hardware.",             color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"       },
];

export default function AboutPage() {
  return (
    <div className="space-y-12">

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden min-h-[240px] flex items-end shadow-card">
        <Image
          src="/images/custom/about1.jpg"
          alt="SE-CDSS clinical decision support system"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-transparent" />
        <div className="relative z-10 p-8">
          <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-1">About SE-CDSS</p>
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-2">
            Sentiment-Enhanced Clinical<br />Decision Support System
          </h1>
          <p className="text-sm text-slate-300 max-w-lg">
            Bridging patient medication experience with evidence-based clinical intelligence.
          </p>
        </div>
      </div>

      {/* What it is */}
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">What is SE-CDSS?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            SE-CDSS analyses free-text patient medication reviews using a fine-tuned BioBERT model,
            classifies clinical sentiment with confidence scoring, maps results to a clinical risk level,
            and generates personalised drug recommendations — all in real time.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The system serves two roles: patients submit reviews and receive immediate feedback,
            while clinicians monitor patient sentiment trends and generate evidence-ranked drug alternatives
            filtered by individual EHR profiles.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
            Developed as a final-year dissertation at <strong className="text-slate-700 dark:text-slate-200">Chinhoyi University of Technology</strong>,
            Zimbabwe, 2026 — BSIT programme.
          </div>
        </div>
        <div className="relative h-60 rounded-2xl overflow-hidden shadow-card">
          <Image
            src="/images/custom/about2.jpg"
            alt="Clinical decision support in practice"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Capability highlights */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-5">System Capabilities</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-card">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Model Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { value: "0.802", label: "BioBERT Weighted F1",  sub: "vs 0.741 baseline" },
            { value: "215k",  label: "Training Reviews",     sub: "UCI Drugs.com dataset" },
            { value: "40k",   label: "Fine-tuning Samples",  sub: "80/20 train/test split" },
            { value: "3",     label: "Sentiment Classes",    sub: "Positive · Neutral · Negative" },
          ].map(({ value, label, sub }) => (
            <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-3 py-3 text-center">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tabular-nums">{value}</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{label}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Confusion matrices */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">BioBERT — Confusion Matrix</p>
            <Image src="/images/biobert_confusion.png" alt="BioBERT confusion matrix" width={420} height={320} className="w-full h-auto rounded-lg" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Model Comparison Chart</p>
            <Image src="/images/model_comparison.png" alt="BioBERT vs baseline model comparison" width={420} height={320} className="w-full h-auto rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Technology Stack</h2>
        <div className="space-y-2">
          {stack.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${color}`}>
              <Icon className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs mt-0.5 opacity-80">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 px-5 py-4">
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Research prototype.</strong> SE-CDSS uses synthetic EHR data and is not connected to any live clinical system.
          All outputs are for research and demonstration purposes only.
        </p>
      </div>

      {/* Footer credit */}
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-6">
        <GitBranch className="h-4 w-4 shrink-0" />
        <span>Panashe M. Chandiwana · C21147799W · Chinhoyi University of Technology · BSIT 2026</span>
      </div>
    </div>
  );
}
