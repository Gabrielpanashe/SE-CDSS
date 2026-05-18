import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep professional navy — used for headings and brand elements
        navy: {
          DEFAULT: "#1E3A5F",
          50:  "#EBF2FA",
          100: "#C5D8EE",
          200: "#8AAED9",
          700: "#1E3A5F",
          800: "#162D4A",
          900: "#0D1B2E",
        },
        // Clinical blue — replaces the electric sky-blue "teal" throughout the UI.
        // Using a standard professional blue keeps it from looking like an AI mockup.
        teal: {
          DEFAULT: "#2563EB",
          50:  "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#1E3A8A",
        },
        // Semantic risk/sentiment colors — kept muted (not neon)
        risk: {
          mild:     "#16A34A",  // green-600
          moderate: "#D97706",  // amber-600
          severe:   "#DC2626",  // red-600
        },
        sentiment: {
          positive: "#16A34A",
          neutral:  "#D97706",
          negative: "#DC2626",
        },
      },
      boxShadow: {
        card:       "0 1px 3px rgba(0,0,0,0.07), 0 2px 10px rgba(15,41,68,0.05)",
        "card-hover":"0 4px 12px rgba(0,0,0,0.09), 0 8px 24px rgba(15,41,68,0.08)",
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [],
};
export default config;
