import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - turbopack options missing from types
    turbopack: {
      root: path.resolve(__dirname, '..'),
    },
  },
};

export default nextConfig;
