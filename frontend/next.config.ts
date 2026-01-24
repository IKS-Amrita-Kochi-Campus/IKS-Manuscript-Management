import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // @ts-expect-error - allowedDevOrigins is a valid option but types might be outdated
    allowedDevOrigins: [
      'localhost',
      'ikskochi.org'
    ]
  }
};

export default nextConfig;
