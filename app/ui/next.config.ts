import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Exclude ONNX runtime and transformers from server bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Completely exclude these packages from server bundle
      config.externals = config.externals || []
      config.externals.push(
        '@xenova/transformers',
        'onnxruntime-node',
        'onnxruntime-common',
        'sharp'
      )
    } else {
      // Client-side: ensure transformers uses WASM backend
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node': false,
      }
    }
    return config
  },
};

export default nextConfig;
