"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

/**
 * Skeleton page — category filter row above a placeholder grid of post
 * cards. No real posts yet; this is the layout scaffold to build the
 * actual blog into once that content exists.
 */
const CATEGORIES = ["All", "Cultivation", "Community", "Recipes"] as const;
type Category = (typeof CATEGORIES)[number];

const PLACEHOLDER_COUNT = 6;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <SectionLabel number="—">Blog</SectionLabel>
        <h1 className="mt-4 max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
          Notes from the grow.
        </h1>
      </Reveal>

      <Reveal delay={0.05} className="mt-8 sm:mt-10">
        <ComingSoonBanner>
          Coming soon — the blog is still being built out.
        </ComingSoonBanner>
      </Reveal>

      {/* Category filter */}
      <div className="mt-10 flex gap-2 overflow-x-auto sm:mt-12">
        {CATEGORIES.map((c) => {
          const isActive = c === activeCategory;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              aria-pressed={isActive}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm tracking-[0.04em] transition-colors",
                isActive
                  ? "bg-neutral-900 text-neutral-50"
                  : "bg-neutral-100 text-neutral-500 hover:text-neutral-900"
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Placeholder grid */}
      <div className="mt-8 grid grid-cols-1 gap-10 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div key={`${activeCategory}-${i}`} className="flex flex-col gap-4">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-neutral-200" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-neutral-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-200" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
