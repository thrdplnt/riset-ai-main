import type { NextConfig } from "next";

const nextConfig = {
  allowedDevOrigins: ['172.20.10.2'],
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

export default nextConfig;
