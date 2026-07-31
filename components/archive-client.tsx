"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComingSoonBanner } from "@/components/coming-soon-banner";
import type { Strain } from "@/lib/strains";

export function ArchiveClient({ batches }: { batches: Strain[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (batches.length === 0) {
    return (
      <ComingSoonBanner>
        Coming soon — no past drops on file yet.
      </ComingSoonBanner>
    );
  }

  const active = batches[activeIndex];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16">
      {/* Selected batch */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={active.image}
            alt={active.name}
            fill
            sizes="(max-width: 1024px) 100vw, 440px"
            className="object-contain"
            priority
          />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="font-display text-2xl tracking-[-0.01em] text-neutral-900">
              {active.name}
            </h2>
            <span className="text-sm tracking-[0.04em] text-neutral-500">
              {active.spectrum}
              {active.thc ? ` · ${active.thc} THC` : ""}
            </span>
          </div>

          {active.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {active.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {active.description}
          </p>

          {active.labReport && (
            <a
              href={active.labReport}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs tracking-[0.04em] text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
            >
              <FileText className="h-3.5 w-3.5" />
              Lab report
            </a>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      <div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 sm:gap-4">
          {batches.map((batch, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={`${batch.slug}-${batch.batchNumber}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-pressed={isActive}
                aria-label={batch.name}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg bg-neutral-100 transition-all",
                  isActive
                    ? "ring-2 ring-neutral-900 ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={batch.image}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-contain"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
