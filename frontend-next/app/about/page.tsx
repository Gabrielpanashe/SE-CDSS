import { Brain, Database, Server, Globe, FlaskConical, GitBranch } from "lucide-react";

const stack = [
  { icon: Brain,        label: "BioBERT",     desc: "dmis-lab/biobert-base-cased-v1.2 · 108.3M parameters · fine-tuned for 3-class sentiment", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { icon: Server,       label: "FastAPI",      desc: "Python 3.12 · async REST API · Pydantic validation · 3 route modules", color: "bg-teal-50 border-teal-200 text-teal-700" },
  { icon: Database,     label: "PostgreSQL",   desc: "SQLAlchemy ORM · Alembic migrations · 3 tables: PredictionLog, PatientFeedback, Recommendation", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { icon: Globe,        label: "Next.js 14",   desc: "TypeScript · Tailwind CSS · App Router · Patient and Clinician portals", color: "bg-slate-50 border-slate-200 text-slate-700" },
  { icon: FlaskConical, label: "scikit-learn", desc: "TF-IDF vectorisation (50k features) + Logistic Regression baseline for model comparison", color: "bg-amber-50 border-amber-200 text-amber-700" },
];

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="section-title">About SE-CDSS</h1>
        <p className="section-subtitle mt-1">
          Sentiment-Enhanced Clinical Decision Support System — what it is, who built it, and how it works under the hood.
        </p>
      </div>

      {/* What it is */}
      <div className="card space-y-3">
        <h2 className="font-bold text-navy text-base">What is SE-CDSS?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          SE-CDSS is a clinical decision support system that bridges the gap between patient-reported
          medication experiences and evidence-based prescribing. It analyses free-text drug reviews using
          a fine-tuned biomedical language model (BioBERT), classifies the sentiment, maps it to a clinical
          risk level, and generates personalised drug recommendations weighted by clinical guidelines, EHR
          profile, and sentiment signal.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          The system was developed as a final-year undergraduate dissertation project at
          Chinhoyi University of Technology (CUT), Zimbabwe, 2026, under the BSIT programme.
        </p>
      </div>

      {/* Data */}
      <div className="card space-y-3">
        <h2 className="font-bold text-navy text-base">Training Data</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "215,063", label: "Drug Reviews" },
            { value: "40,000",  label: "Training Samples" },
            { value: "3",       label: "Sentiment Classes" },
            { value: "80/20",   label: "Train / Test Split" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-3 text-center">
              <p className="text-xl font-extrabold text-navy tabular-nums">{value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Dataset: UCI Drug Review Dataset (Drugs.com). Labels derived from user ratings:
          rating ≥ 7 → Positive · rating 4–6 → Neutral · rating ≤ 3 → Negative.
        </p>
      </div>

      {/* Tech stack */}
      <div className="space-y-3">
        <h2 className="font-bold text-navy text-base">Technology Stack</h2>
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
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Research prototype.</strong> SE-CDSS uses synthetic EHR data and is not connected to any live
          clinical system. All outputs are for research and demonstration purposes only. Do not use for actual
          clinical decisions without validation by a qualified medical professional.
        </p>
      </div>

      {/* Source */}
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <GitBranch className="h-4 w-4" />
        <span>Source code available upon request · Student: Panashe M. Chandiwana · C21147799W</span>
      </div>
    </div>
  );
}
