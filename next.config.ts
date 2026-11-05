import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Proxy / Rewrite คำขอจากหน้าบ้านไปยัง Backend โดยตรง
  // เพื่อให้ใช้ Server-side Environment Variable (API_URL) โดยไม่ต้องใส่ NEXT_PUBLIC_
  async rewrites() {
    const backendUrl = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/swagger/:path*",
        destination: `${backendUrl}/swagger/:path*`,
      },
    ];
  },
};

export default nextConfig;
