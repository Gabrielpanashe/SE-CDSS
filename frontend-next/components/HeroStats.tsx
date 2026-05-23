import { Brain, Users, Pill, Activity, BookOpen } from "lucide-react";

const STATS = [
  { value: "0.802", label: "BioBERT F1 Score",     icon: Brain,    accent: "text-blue-600  dark:text-blue-400"  },
  { value: "215k",  label: "Drug Reviews Trained",  icon: BookOpen, accent: "text-purple-600 dark:text-purple-400" },
  { value: "50",    label: "Simulated Patients",    icon: Users,    accent: "text-emerald-600 dark:text-emerald-400" },
  { value: "5",     label: "Conditions Covered",    icon: Activity, accent: "text-amber-600  dark:text-amber-400"  },
  { value: "25",    label: "Drugs in Evidence Base",icon: Pill,     accent: "text-slate-600  dark:text-slate-300"  },
];

export function HeroStats() {
  return (
    <div className="grid grid-cols-5 gap-px rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-card bg-slate-200 dark:bg-slate-700">
      {STATS.map(({ value, label, icon: Icon, accent }) => (
        <div key={label} className="bg-white dark:bg-slate-800 px-4 py-5 flex flex-col items-center gap-2 text-center">
          <Icon className={`h-4 w-4 ${accent}`} />
          <p className={`text-2xl font-extrabold tabular-nums ${accent}`}>{value}</p>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
}
