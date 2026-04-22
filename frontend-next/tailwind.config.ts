import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F2944",
          50: "#E8EFF6",
          100: "#C5D5E8",
          200: "#8AAAC8",
          700: "#0F2944",
          800: "#0B1F35",
          900: "#070F1A",
        },
        teal: {
          DEFAULT: "#0EA5E9",
          50: "#E0F4FD",
          100: "#BAE8FB",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
        },
        risk: {
          mild: "#22C55E",
          moderate: "#F59E0B",
          severe: "#EF4444",
        },
        sentiment: {
          positive: "#22C55E",
          neutral: "#F59E0B",
          negative: "#EF4444",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(15,41,68,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10), 0 8px 32px rgba(15,41,68,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
