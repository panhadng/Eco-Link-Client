import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/ocelot/**',
      },
      {
        protocol: 'http',
        hostname: '13.203.0.20',
        port: '9000',
        pathname: '/ocelot/**',
      },
      {
        protocol: 'http',
        hostname: '13.203.0.20',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
