import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder images only — remove once real photography lands.
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Blog hero images — hosted on Cloudinary, referenced via URL in
      // the "Hero Image" column of the blog's Google Sheet.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;