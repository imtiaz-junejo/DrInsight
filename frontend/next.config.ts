import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/doctors",
        destination: "/our-doctors",
        permanent: true,
      },
      {
        source: "/doctors/:path*",
        destination: "/our-doctors/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
