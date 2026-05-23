/** @type {import('next').NextConfig} */

// Server-side proxy target — read at runtime so Docker can inject http://api:8000
// without baking it into the client bundle at build time.
// Falls back to localhost for local dev (npm run dev).
const API_URL = process.env.API_URL ?? "http://localhost:8000";

const nextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },

  // Proxy every API call through the Next.js server so the browser only ever
  // talks to the same origin (no CORS issues, no hardcoded backend host in JS).
  async rewrites() {
    return [
      { source: "/api/:path*",           destination: `${API_URL}/api/:path*` },
      { source: "/auth/:path*",          destination: `${API_URL}/auth/:path*` },
      { source: "/notifications/:path*", destination: `${API_URL}/notifications/:path*` },
      { source: "/health",               destination: `${API_URL}/health` },
      { source: "/admin/:path*",         destination: `${API_URL}/admin/:path*` },
    ];
  },
};

export default nextConfig;
