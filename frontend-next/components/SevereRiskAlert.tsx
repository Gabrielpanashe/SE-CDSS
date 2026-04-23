import { AlertOctagon, Phone } from "lucide-react";

interface Props {
  riskLevel: string;
  drugName?: string;
}

export function SevereRiskAlert({ riskLevel, drugName }: Props) {
  if (!riskLevel.toLowerCase().includes("severe")) return null;

  return (
    <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 shadow">
          <AlertOctagon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-red-800 text-base leading-tight">
            Severe Adverse Reaction Detected
          </p>
          <p className="mt-1 text-sm text-red-700 leading-relaxed">
            {drugName
              ? <>The patient&apos;s feedback regarding <strong>{drugName}</strong> has triggered a severe adverse reaction flag.</>
              : <>This feedback has triggered a severe adverse reaction flag.</>
            }
            {" "}Immediate clinical review is recommended.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-red-700">
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 border border-red-200 px-2.5 py-1">
              <Phone className="h-3 w-3" /> Notify treating clinician
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 border border-red-200 px-2.5 py-1">
              Review medication immediately
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 border border-red-200 px-2.5 py-1">
              Consider alternative drug options below
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
