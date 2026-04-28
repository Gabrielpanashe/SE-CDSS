import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Activity, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "SE-CDSS | Sentiment-Enhanced Clinical Decision Support",
  description:
    "AI-assisted clinical decision support system — submit medication feedback and receive risk-stratified drug recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 antialiased transition-colors duration-200">
        <ThemeProvider>
          <Sidebar />
          <div className="ml-64 flex min-h-screen flex-col">
            <main className="flex-1 px-8 py-8 max-w-5xl">
              {children}
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">

                {/* Left — logo + name */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-brand shadow-md">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-navy dark:text-slate-100 text-sm leading-tight">SE&#8209;CDSS</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Sentiment-Enhanced Clinical Decision Support
                    </p>
                  </div>
                </div>

                {/* Centre — advisory badge */}
                <div className="flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-700
                  bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    Advisory only · Must be reviewed by a qualified clinician
                  </p>
                </div>

                {/* Right — university info */}
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Chinhoyi University of Technology
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    BECE · Final Year Project · 2026
                  </p>
                </div>

              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
