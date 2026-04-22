import Link from "next/link";
import {
  Activity, Stethoscope, Brain, Shield, TrendingUp, Database,
  ArrowRight, CheckCircle, Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "BioBERT Sentiment Analysis",
    desc: "Fine-tuned biomedical language model classifies patient feedback as positive, neutral, or negative with clinical-grade confidence scores.",
    color: "text-teal-500 bg-teal-50",
  },
  {
    icon: Shield,
    title: "Risk Classification",
    desc: "Automatic escalation from Mild Concern to Severe Adverse Reaction using confidence thresholds and adverse keyword detection.",
    color: "text-red-500 bg-red-50",
  },
  {
    icon: TrendingUp,
    title: "Drug Recommendations",
    desc: "Multi-factor scoring engine combining clinical guidelines (33%), EHR history (33%), and patient sentiment (33%) for ranked recommendations.",
    color: "text-navy bg-navy-50",
  },
  {
    icon: Database,
    title: "Longitudinal Monitoring",
    desc: "Track sentiment trends over time per patient — visualised as interactive charts so clinicians spot deteriorating patterns early.",
    color: "text-purple-500 bg-purple-50",
  },
];

const conditions = [
  { name: "Hypertension",  drugs: "Amlodipine · Lisinopril · Losartan" },
  { name: "Diabetes",      drugs: "Metformin · Insulin Glargine · Empagliflozin" },
  { name: "Depression",    drugs: "Escitalopram · Sertraline · Venlafaxine" },
  { name: "Malaria",       drugs: "Artemether-Lumefantrine · Quinine · Atovaquone" },
  { name: "Respiratory",   drugs: "Salbutamol · Azithromycin · Amoxicillin" },
];

const hypotheses = [
  { id: "H1", text: "BioBERT achieves ≥ 80% macro F1 on the drug review dataset" },
  { id: "H2", text: "BioBERT outperforms TF-IDF + Logistic Regression baseline" },
  { id: "H3", text: "Sentiment integration improves recommendation quality" },
  { id: "H4", text: "System deployable via single docker-compose command" },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl gradient-brand px-8 py-14 text-white shadow-card">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Zap className="h-3 w-3" />
            Final Year Dissertation · Chinhoyi University of Technology · 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            Sentiment-Enhanced<br />
            <span className="text-teal-300">Clinical Decision Support</span>
          </h1>
          <p className="text-base text-blue-100 leading-relaxed mb-8 max-w-xl">
            SE-CDSS uses BioBERT-powered sentiment analysis of patient medication feedback to generate
            explainable, risk-stratified drug recommendations — bridging the gap between patient experience
            and precision medicine.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/patient" className="inline-flex items-center gap-2 rounded-xl bg-white text-navy
              font-semibold px-5 py-2.5 text-sm hover:bg-teal-50 transition-colors shadow">
              <Activity className="h-4 w-4" />
              Patient Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/clinician" className="inline-flex items-center gap-2 rounded-xl bg-white/15
              text-white font-semibold px-5 py-2.5 text-sm hover:bg-white/25 transition-colors backdrop-blur-sm">
              <Stethoscope className="h-4 w-4" />
              Clinician Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="section-title text-center mb-2">System Capabilities</h2>
        <p className="section-subtitle text-center mb-8">Four integrated components delivering evidence-informed recommendations</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card card-hover">
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy mb-2 text-sm leading-snug">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Research Hypotheses */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="section-title mb-1">Research Hypotheses</h2>
          <p className="section-subtitle mb-5">Evaluated empirically in Chapter 4</p>
          <div className="space-y-3">
            {hypotheses.map(({ id, text }) => (
              <div key={id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                  bg-teal-500 text-white text-xs font-bold">{id}</span>
                <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-1">Supported Conditions</h2>
          <p className="section-subtitle mb-5">5 conditions · 25 drugs in evidence base</p>
          <div className="space-y-2.5">
            {conditions.map(({ name, drugs }) => (
              <div key={name} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-navy text-sm">{name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{drugs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-2xl
        bg-navy-800 bg-navy px-8 py-6 text-white">
        <div>
          <h3 className="font-bold text-lg">Ready to explore the system?</h3>
          <p className="text-sm text-blue-200 mt-0.5">Submit a review or look up a patient&rsquo;s trend data.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/patient"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400
              text-white font-semibold px-5 py-2.5 text-sm transition-colors">
            <Activity className="h-4 w-4" />
            Patient Portal
          </Link>
          <Link href="/clinician"
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25
              text-white font-semibold px-5 py-2.5 text-sm transition-colors backdrop-blur-sm">
            <Stethoscope className="h-4 w-4" />
            Clinician View
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <CheckCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Advisory only.</strong> SE-CDSS outputs are AI-generated decision support and must be reviewed by a qualified healthcare professional before any clinical action is taken.
        </p>
      </div>
    </div>
  );
}
