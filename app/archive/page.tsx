"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

/**
 * Skeleton page — year + quarter tabs on the left filter a placeholder
 * grid on the right. No real archive data yet; this is the layout
 * scaffold to build the actual drop history into once that data exists.
 */
const YEARS = ["2025", "2024", "2023"] as const;
type Year = (typeof YEARS)[number];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
type Quarter = (typeof QUARTERS)[number];

const PLACEHOLDER_COUNT = 9;

export default function ArchivePage() {
  const [activeYear, setActiveYear] = useState<Year>("2025");
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Q1");

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <SectionLabel number="—">Archive</SectionLabel>
        <h1 className="mt-4 max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
          Past drops, by year and quarter.
        </h1>
      </Reveal>

      <Reveal delay={0.05} className="mt-8 sm:mt-10">
        <ComingSoonBanner>
          Coming soon — the drop archive is still being built out.
        </ComingSoonBanner>
      </Reveal>

      <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-[160px_1fr] lg:gap-16">
        {/* Year + quarter tabs */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:h-fit">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
            {YEARS.map((y) => {
              const isActive = y === activeYear;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setActiveYear(y)}
                  aria-pressed={isActive}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-left text-sm tabular-nums tracking-[0.04em] transition-colors lg:rounded-none lg:px-4 lg:py-1.5",
                    isActive
                      ? "bg-neutral-900 text-neutral-50 lg:bg-transparent lg:font-medium lg:text-neutral-900"
                      : "bg-neutral-100 text-neutral-500 hover:text-neutral-900 lg:bg-transparent lg:text-neutral-400 lg:hover:text-neutral-900"
                  )}
                >
                  {y}
                </button>
              );
            })}
          </div>

          <div className="hidden h-px w-8 bg-neutral-300 lg:block" />

          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
            {QUARTERS.map((q) => {
              const isActive = q === activeQuarter;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setActiveQuarter(q)}
                  aria-pressed={isActive}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-left text-sm tracking-[0.04em] transition-colors lg:rounded-none lg:border-l lg:px-4 lg:py-2.5",
                    isActive
                      ? "bg-neutral-900 text-neutral-50 lg:border-neutral-900 lg:bg-transparent lg:font-medium lg:text-neutral-900"
                      : "bg-neutral-100 text-neutral-500 hover:text-neutral-900 lg:border-neutral-200 lg:bg-transparent lg:hover:border-neutral-400"
                  )}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>

        {/* Placeholder grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <div key={`${activeYear}-${activeQuarter}-${i}`} className="flex flex-col gap-3">
              <div className="aspect-square animate-pulse rounded-2xl bg-neutral-200" />
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-neutral-200" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
