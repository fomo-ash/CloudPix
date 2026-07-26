import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cloudpix/shared"],

  /**
   * Proxy /api/* requests through the Next.js server to the Express backend.
   * This avoids CORS issues entirely — the browser only talks to the Next.js
   * origin, and Next.js forwards requests server-side.
   *
   * Defaults to Docker internal hostname. For local dev without Docker,
   * set BACKEND_URL=http://localhost:3100 in apps/web/.env.local
   */
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "http://cloudpix-api:3000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
