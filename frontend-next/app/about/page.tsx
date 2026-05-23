import Image from "next/image";
import { Brain, Database, Server, Globe, FlaskConical, GitBranch } from "lucide-react";

const stack = [
  { icon: Brain,        label: "BioBERT",     desc: "dmis-lab/biobert-base-cased-v1.2 · 108.3M parameters · fine-tuned for 3-class sentiment", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300" },
  { icon: Server,       label: "FastAPI",      desc: "Python 3.12 · async REST API · Pydantic validation · 3 route modules",                    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300"           },
  { icon: Database,     label: "PostgreSQL",   desc: "SQLAlchemy ORM · Alembic migrations · 3 tables: PredictionLog, PatientFeedback, Recommendation", color: "bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"      },
  { icon: Globe,        label: "Next.js 14",   desc: "TypeScript · Tailwind CSS · App Router · Patient and Clinician portals",                   color: "bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"          },
  { icon: FlaskConical, label: "scikit-learn", desc: "TF-IDF vectorisation (50k features) + Logistic Regression baseline for model comparison",  color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300"       },
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
        <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">What is SE-CDSS?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          SE-CDSS is a clinical decision support system that bridges the gap between patient-reported
          medication experiences and evidence-based prescribing. It analyses free-text drug reviews using
          a fine-tuned biomedical language model (BioBERT), classifies the sentiment, maps it to a clinical
          risk level, and generates personalised drug recommendations weighted by clinical guidelines, EHR
          profile, and sentiment signal.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The system was developed as a final-year undergraduate dissertation project at
          Chinhoyi University of Technology (CUT), Zimbabwe, 2026, under the BSIT programme.
        </p>
      </div>

      {/* Data stats */}
      <div className="card space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Training Data</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "215,063", label: "Drug Reviews" },
            { value: "40,000",  label: "Training Samples" },
            { value: "3",       label: "Sentiment Classes" },
            { value: "80/20",   label: "Train / Test Split" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-3 py-3 text-center">
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tabular-nums">{value}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Dataset: UCI Drug Review Dataset (Drugs.com). Labels derived from user ratings:
          rating ≥ 7 → Positive · rating 4–6 → Neutral · rating ≤ 3 → Negative.
        </p>
      </div>

      {/* Confusion matrices */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Model Evaluation</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          BioBERT achieves a weighted F1 of <strong className="text-slate-800 dark:text-slate-200">0.802</strong> on the held-out test set,
          outperforming the TF-IDF + Logistic Regression baseline (F1 0.741) across all three sentiment classes.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">BioBERT (fine-tuned)</p>
            <Image
              src="/images/biobert_confusion.png"
              alt="BioBERT confusion matrix — Positive / Neutral / Negative"
              width={480}
              height={360}
              className="w-full h-auto rounded-lg"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">Weighted F1: 0.802 · Test set: 8,000 samples</p>
          </div>
          <div className="card space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">TF-IDF Baseline</p>
            <Image
              src="/images/baseline_confusion.png"
              alt="TF-IDF baseline confusion matrix"
              width={480}
              height={360}
              className="w-full h-auto rounded-lg"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">Weighted F1: 0.741 · Same test set</p>
          </div>
        </div>
      </div>

      {/* Model comparison chart */}
      <div className="card space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Full Model Comparison</h2>
        <Image
          src="/images/model_comparison.png"
          alt="BioBERT vs TF-IDF Logistic Regression model comparison chart"
          width={700}
          height={420}
          className="w-full h-auto rounded-lg"
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          BioBERT vs TF-IDF baseline — accuracy, precision, recall, and F1 by sentiment class
        </p>
      </div>

      {/* Tech stack */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Technology Stack</h2>
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
          <strong>Research prototype.</strong> SE-CDSS uses synthetic EHR data and is not connected to any live
          clinical system. All outputs are for research and demonstration purposes only. Do not use for actual
          clinical decisions without validation by a qualified medical professional.
        </p>
      </div>

      {/* Source */}
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <GitBranch className="h-4 w-4" />
        <span>Student: Panashe M. Chandiwana · C21147799W · Chinhoyi University of Technology · 2026</span>
      </div>
    </div>
  );
}
