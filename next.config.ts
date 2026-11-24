import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The blog (Learn → The Knowledge) and the Merch page were removed: both
   * were empty placeholders. Their old addresses may still be in Google's
   * index or in someone's bookmarks, so they redirect permanently (308)
   * to the closest live page instead of answering 404.
   */
  async redirects() {
    return [
      { source: "/learn/the-knowledge/:slug*", destination: "/learn", permanent: true },
      { source: "/merch", destination: "/", permanent: true },
      { source: "/admin/posts/:path*", destination: "/admin", permanent: false },
    ];
  },
  images: {
    // AVIF first, WebP for browsers without it. AVIF files are markedly
    // smaller for photos, and the home page's photos were its heaviest
    // downloads (one alone was ~490 KB on a phone).
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Placeholder images only — remove once real photography lands.
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Site photography — strains, Learn pages and the farm gallery —
      // hosted on Cloudinary.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/g0mcdcfr/**"
      },
    ],
  },
};

export default nextConfig;