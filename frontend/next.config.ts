import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "@solar-icons/react",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
    ],
  },
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
