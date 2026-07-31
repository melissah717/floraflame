"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComingSoonBanner } from "@/components/coming-soon-banner";
import type { Strain } from "@/lib/strains";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;

export function ArchiveClient({ batches }: { batches: Strain[] }) {
  const years = useMemo(
    () => [...new Set(batches.map((b) => b.year).filter((y): y is number => y != null))].sort(
      (a, b) => b - a
    ),
    [batches]
  );

  const [activeYear, setActiveYear] = useState(years[0]);
  const [activeQuarter, setActiveQuarter] = useState<(typeof QUARTERS)[number]>("Q1");

  if (years.length === 0) {
    return (
      <ComingSoonBanner>
        Coming soon — no past drops on file yet.
      </ComingSoonBanner>
    );
  }

  const filtered = batches.filter(
    (b) => b.year === activeYear && b.quarter === activeQuarter
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[160px_1fr] lg:gap-16">
      {/* Year + quarter tabs */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:h-fit">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
          {years.map((y) => {
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

      {/* Batches */}
      {filtered.length === 0 ? (
        <ComingSoonBanner>
          {`No drops on file for ${activeYear} ${activeQuarter} yet.`}
        </ComingSoonBanner>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {filtered.map((batch) => {
            const card = (
              <>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={batch.image}
                    alt={batch.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-neutral-900">{batch.name}</span>
                  <span className="text-xs tracking-[0.04em] text-neutral-500">
                    {batch.spectrum}
                    {batch.thc ? ` · ${batch.thc} THC` : ""}
                  </span>
                </div>
              </>
            );

            return batch.labReport ? (
              <a
                key={`${batch.slug}-${batch.batchNumber}`}
                href={batch.labReport}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3"
              >
                {card}
                <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.04em] text-neutral-400 group-hover:text-neutral-900">
                  <FileText className="h-3 w-3" />
                  Lab report
                </span>
              </a>
            ) : (
              <div key={`${batch.slug}-${batch.batchNumber}`} className="flex flex-col gap-3">
                {card}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
