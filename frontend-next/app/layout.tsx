import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

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

            {/*
              Contrasting footer:
              Light mode → dark navy footer (stands out from light bg)
              Dark  mode → white/light footer (stands out from dark bg)
            */}
            <footer className="
              border-t
              bg-navy dark:bg-slate-100
              border-navy/20 dark:border-slate-200
              px-8 py-5
            ">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-sm font-bold text-white dark:text-navy">SE-CDSS</p>
                  <p className="text-xs text-white/60 dark:text-navy/60 mt-0.5">
                    Sentiment-Enhanced Clinical Decision Support System
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70 dark:text-navy/70">
                    Chinhoyi University of Technology · BSIT · 2026
                  </p>
                  <p className="text-xs text-white/50 dark:text-navy/50 mt-0.5">
                    Advisory only · All outputs must be reviewed by a qualified healthcare professional.
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
