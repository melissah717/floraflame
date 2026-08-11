import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

const BASE_URL = "https://floraflame.ca";

// /merch is excluded on purpose — it's a thin placeholder page (see its
// own noindex) with nothing unique for a search engine to index yet.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/strains`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/learn`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/learn/the-leaf`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/learn/the-soil`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/learn/the-farm`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/learn/the-knowledge`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const posts = await getBlogPosts();
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/learn/the-knowledge/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes];
}
