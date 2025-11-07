import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://server.pariksahub.com/sitemap.xml',
      },
    ];
  },
};

export default nextConfig;
