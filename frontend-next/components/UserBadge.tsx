"use client";

import { useEffect, useState } from "react";
import { getEmail, getRole, getPatientId } from "@/lib/auth";
import { User, Stethoscope } from "lucide-react";

export function UserBadge() {
  const [email, setEmail]         = useState<string | null>(null);
  const [role, setRole]           = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getEmail());
    setRole(getRole());
    setPatientId(getPatientId());
  }, []);

  if (!email) return null;

  const displayName = role === "patient" && patientId ? patientId : email;
  const initial     = displayName[0].toUpperCase();
  const isPatient   = role === "patient";

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700
      bg-white dark:bg-slate-800 px-3 py-2">
      {/* Avatar circle */}
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold
        ${isPatient ? "bg-teal-500" : "bg-navy"}`}>
        {initial}
      </div>

      {/* Name + role */}
      <div className="leading-tight">
        <p className="text-sm font-semibold text-navy dark:text-slate-100">{displayName}</p>
        <p className="flex items-center gap-1 text-[11px] text-slate-400 capitalize">
          {isPatient
            ? <User className="h-2.5 w-2.5" />
            : <Stethoscope className="h-2.5 w-2.5" />}
          {role}
        </p>
      </div>
    </div>
  );
}
