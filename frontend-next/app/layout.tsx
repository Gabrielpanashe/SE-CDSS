import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SE-CDSS | Sentiment-Enhanced Clinical Decision Support",
  description:
    "AI-assisted clinical decision support system using sentiment analysis of patient medication feedback to inform precision medicine recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="mt-16 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs text-slate-400">
              SE-CDSS &mdash; Chinhoyi University of Technology · Final Year Dissertation 2026
            </p>
            <p className="text-xs text-slate-400">
              Advisory only · All clinical decisions must be made by a qualified healthcare professional
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
