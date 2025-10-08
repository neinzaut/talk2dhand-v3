import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the root directory for the Next.js app
  basePath: "",
  
  // Configure the source directory for pages/app
  distDir: ".next",
  
  // The UI is in app/ui
  dir: "./app/ui",

  // Enable React strict mode
  reactStrictMode: true,

  // Disable server-side rendering for specific pages
  // Add any paths that should be static-only
  // staticPageGenerationTimeout: 120,
};

export default nextConfig;
