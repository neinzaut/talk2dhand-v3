import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Set the workspace root to fix warning
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
};

export default nextConfig;
