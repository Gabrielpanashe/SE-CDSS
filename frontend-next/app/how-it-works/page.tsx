import Image from "next/image";
import Link from "next/link";
import { Brain, Shield, TrendingUp, FileText, Database, Activity, ChevronRight } from "lucide-react";

const steps = [
  {
    num: "01", icon: FileText, color: "bg-blue-600",
    title: "You submit a review",
    desc: "You describe your medication experience in plain language — how you feel, any side effects, whether it seems to be working. No medical jargon needed.",
    detail: "Provide your Patient ID, the drug name, your condition, and a free-text description of your experience.",
  },
  {
    num: "02", icon: Brain, color: "bg-purple-600",
    title: "AI cleans and reads your text",
    desc: "Your review is automatically cleaned — HTML stripped, text normalised, medical terms preserved. The BioBERT model then reads it the same way a clinical language expert would.",
    detail: "BioBERT is a biomedical language model fine-tuned on 215,063 drug reviews. It understands clinical phrasing that general models miss.",
  },
  {
    num: "03", icon: Activity, color: "bg-indigo-600",
    title: "Sentiment is classified",
    desc: "SE-CDSS classifies your review as Positive, Neutral, or Negative — with a confidence score showing how certain the model is.",
    detail: "The model outputs probabilities for all three classes. The highest probability becomes the prediction. Confidence above 87% is considered high-certainty.",
  },
  {
    num: "04", icon: Shield, color: "bg-red-500",
    title: "Clinical risk is assessed",
    desc: "The sentiment and confidence are mapped to a clinical risk level. Specific adverse keywords — like 'chest pain', 'allergic', or 'emergency' — trigger an automatic escalation to Severe, regardless of sentiment.",
    detail: "Risk levels: Positive → Mild Concern · Neutral → Moderate Risk · Negative → Severe Adverse Reaction. Keyword override is always applied last.",
  },
  {
    num: "05", icon: Database, color: "bg-amber-500",
    title: "Your health profile is looked up",
    desc: "The system retrieves your Electronic Health Record — your condition, known allergies, and current medications — to make sure recommendations are personalised to you.",
    detail: "EHR data is used only to filter out unsafe drugs and weight recommendations. All records are synthetic in this prototype.",
  },
  {
    num: "06", icon: TrendingUp, color: "bg-emerald-600",
    title: "Drugs are scored and ranked",
    desc: "Every candidate drug for your condition is scored using three equal factors: how well it fits clinical guidelines, how well it matches your EHR profile, and how patients with similar sentiment have responded to it.",
    detail: "Formula: Score = (0.33 × GuidelineScore) + (0.33 × EHRScore) + (0.33 × SentimentScore). Top 3 are returned.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="section-title">How SE-CDSS Works</h1>
        <p className="section-subtitle mt-1">
          Six steps from your words to a clinical recommendation. No medical knowledge required on your end.
        </p>
      </div>

      {/* Pipeline steps */}
      <div className="space-y-4">
        {steps.map(({ num, icon: Icon, color, title, desc, detail }, i) => (
          <div key={num} className="flex gap-5">
            {/* Icon + connector line */}
            <div className="flex flex-col items-center">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} shadow text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              {i < steps.length - 1 && (
                <div className="mt-2 w-px flex-1 bg-slate-200 dark:bg-slate-700 min-h-[24px]" />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">STEP {num}</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base mb-1.5 mt-0.5">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-2">{desc}</p>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture diagram */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">System Architecture</h2>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-card">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Figure 3.1 — Architecture Block Diagram</p>
          </div>
          <div className="p-4">
            <Image
              src="/images/architecture.png"
              alt="SE-CDSS system architecture block diagram"
              width={800}
              height={450}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Flowchart */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Processing Flowchart</h2>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-card">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Figure 3.4 — Detailed Processing Flowchart</p>
          </div>
          <div className="p-4">
            <Image
              src="/images/flowchart.png"
              alt="SE-CDSS detailed processing flowchart"
              width={800}
              height={600}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-50">Ready to try it?</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Submit a review and see the full analysis in real time.</p>
        </div>
        <Link href="/patient"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors shrink-0">
          Patient Portal <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
