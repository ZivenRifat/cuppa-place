// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/uploads/**",
      },
      // kalau nanti backend kamu di domain lain, tinggal tambahkan entry baru di sini
      // {
      //   protocol: "https",
      //   hostname: "api.cuppaplace.com",
      //   port: "",
      //   pathname: "/uploads/**",
      // },
    ],
  },
};

export default nextConfig;
