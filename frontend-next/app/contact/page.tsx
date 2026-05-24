import { Mail, Phone, MapPin, Clock, Stethoscope, GraduationCap, GitBranch, ArrowRight } from "lucide-react";
import Link from "next/link";

const contacts = [
  {
    icon: Mail,
    label: "General Enquiries",
    value: "info@se-cdss.ac.zw",
    href: "mailto:info@se-cdss.ac.zw",
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Mail,
    label: "Technical Support",
    value: "support@se-cdss.ac.zw",
    href: "mailto:support@se-cdss.ac.zw",
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Phone,
    label: "Helpdesk (Mon–Fri, 8 am–5 pm CAT)",
    value: "+263 67 2024 100",
    href: "tel:+2636720241000",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: GitBranch,
    label: "Source Code & Issues",
    value: "github.com/Gabrielpanashe/SE-CDSS",
    href: "https://github.com/Gabrielpanashe/SE-CDSS",
    color: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800",
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">

      {/* Page header */}
      <div className="text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Get In Touch
        </p>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Contact SE&#8209;CDSS
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Questions about the system, research collaboration, or clinical evaluation?
          Reach out — we&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {contacts.map(({ icon: Icon, label, value, href, color }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800 p-5 shadow-card
              hover:shadow-card-hover hover:border-blue-200 dark:hover:border-blue-700/50
              transition-all duration-200"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {value}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Office / Institution */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Institution</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: GraduationCap, line: "Chinhoyi University of Technology" },
              { icon: MapPin,        line: "Hospital Road, Chinhoyi, Mashonaland West, Zimbabwe" },
              { icon: Phone,         line: "+263 67 2024 100" },
              { icon: Mail,          line: "info@cut.ac.zw" },
            ].map(({ icon: Icon, line }) => (
              <div key={line} className="flex items-start gap-3">
                <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{line}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research team */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Research Team</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: "Panashe M. Chandiwana",  role: "Principal Researcher & Developer", id: "C21147799W", email: "panashechandiwana11@gmail.com" },
              { name: "Department of ICT",       role: "Supervising Department",           id: "CUT",       email: "ict@cut.ac.zw" },
            ].map(({ name, role, id, email }) => (
              <div key={name} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-3">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{role}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded px-1.5 py-0.5">
                    {id}
                  </span>
                  <a href={`mailto:${email}`} className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Office hours */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700">
            <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-slate-50 text-base">Support Hours</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { day: "Monday – Friday", hours: "08:00 – 17:00",  note: "Full support available"         },
            { day: "Saturday",        hours: "09:00 – 13:00",  note: "Email support only"             },
            { day: "Sunday & Public Holidays", hours: "Closed", note: "Emergency email monitored"     },
          ].map(({ day, hours, note }) => (
            <div key={day} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-4 py-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{day}</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-50 mt-1 tabular-nums">{hours}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
          All times in Central Africa Time (CAT, UTC+2). Response target: within 1 business day for non-urgent queries.
        </p>
      </div>

      {/* Advisory notice */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 px-5 py-4">
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Note:</strong> SE-CDSS is a research prototype developed for academic purposes.
          It is not a registered medical device. For urgent clinical matters, please contact your healthcare provider directly.
        </p>
      </div>

      {/* Back to home */}
      <div className="text-center">
        <Link href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
