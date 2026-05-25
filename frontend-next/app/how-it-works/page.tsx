import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    image: "/images/custom/howitworks1.jpg",
    title: "Submit Your Medication Feedback",
    desc: "Log in to the Patient Portal and describe your medication experience in your own words — side effects, improvements, concerns. Select your condition and drug from the dropdown. No medical jargon required.",
    callout: "Works for all 5 supported conditions: hypertension, diabetes, depression, malaria, and respiratory illness.",
  },
  {
    num: "02",
    image: "/images/custom/howitworks2.jpg",
    title: "AI Reads and Classifies Your Review",
    desc: "Your text is passed to a BioBERT model trained on 215,000 real drug reviews. It classifies the sentiment as Positive, Neutral, or Negative with a confidence score — understanding clinical phrases a standard AI would miss.",
    callout: "Keyword safety override: words like 'chest pain', 'allergic reaction', or 'stopped taking' instantly escalate the risk level regardless of overall sentiment.",
  },
  {
    num: "03",
    image: "/images/custom/howitworks3.jpg",
    title: "Risk Level and EHR Assessment",
    desc: "The sentiment is mapped to a clinical risk level — Mild Concern, Moderate Risk, or Severe Adverse Reaction. The system then pulls your Electronic Health Record to check allergies, existing medications, and condition history.",
    callout: "Severe Adverse Reaction triggers a visible red alert for both the patient and the clinician immediately.",
  },
  {
    num: "04",
    image: "/images/custom/howitworks4.jpg",
    title: "Personalised Drug Recommendations",
    desc: "Every candidate drug for your condition is scored against three equal factors: clinical guideline fit, EHR compatibility, and how patients with similar sentiment responded. The top 3 are ranked and displayed — ready for your care team to review.",
    callout: "Scoring formula: 0.33 × Guideline + 0.33 × EHR Match + 0.33 × Sentiment Score.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div>
        <h1 className="section-title">How It Works</h1>
        <p className="section-subtitle mt-1">
          From a patient typing a review to a clinician seeing ranked drug alternatives — four steps, seconds apart.
        </p>
      </div>

      <div className="space-y-12">
        {steps.map(({ num, image, title, desc, callout }, i) => (
          <div key={num} className={`grid gap-6 lg:grid-cols-2 items-center ${i % 2 !== 0 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            {/* Image */}
            <div className="relative h-60 rounded-2xl overflow-hidden shadow-card">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow">
                  {num}
                </span>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1">Step {num}</p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3 leading-snug">{title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{desc}</p>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {callout}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 px-6 py-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-50 text-base">Ready to try it?</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
            Log in and submit your first review — results appear in seconds.
          </p>
        </div>
        <Link href="/patient"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors shrink-0">
          Go to Patient Portal <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
