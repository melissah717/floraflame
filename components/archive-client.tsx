"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComingSoonBanner } from "@/components/coming-soon-banner";
import { SpectrumBackdrop } from "@/components/spectrum-backdrop";
import type { Strain } from "@/lib/strains";

export function ArchiveClient({ batches }: { batches: Strain[] }) {
  const currentBatches = batches.filter((b) => b.isCurrent);

  const [activeIndex, setActiveIndex] = useState(() => {
    const firstCurrent = batches.findIndex((b) => b.isCurrent);
    return firstCurrent === -1 ? 0 : firstCurrent;
  });

  if (batches.length === 0) {
    return (
      <ComingSoonBanner tone="light">
        Coming soon — no past drops on file yet.
      </ComingSoonBanner>
    );
  }

  const active = batches[activeIndex];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16">
      {/* Selected batch */}
      <div>
        <div className="relative isolate aspect-square overflow-hidden rounded-2xl bg-neutral-800">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.spectrum}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <SpectrumBackdrop spectrum={active.spectrum} />
              </motion.div>
            </AnimatePresence>
          </div>
          <Image
            src={active.nugImage ?? active.image}
            alt={active.name}
            fill
            sizes="(max-width: 1024px) 100vw, 440px"
            className="object-contain"
            priority
          />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-display text-2xl tracking-[-0.01em] text-neutral-50">
                {active.name}
              </h2>
              {active.isCurrent && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-400" aria-hidden />
                  In rotation
                </span>
              )}
            </div>
            <span className="text-sm tracking-[0.04em] text-neutral-400">
              {active.spectrum}
              {active.thc ? ` · ${active.thc} THC` : ""}
            </span>
          </div>

          {active.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {active.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] tracking-[0.06em] text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-1 text-sm leading-relaxed text-neutral-300 sm:text-base">
            {active.description}
          </p>

          {active.labReport && (
            <a
              href={active.labReport}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-xs tracking-[0.04em] text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-50"
            >
              <FileText className="h-3.5 w-3.5" />
              Lab report
            </a>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex flex-col gap-8">
        {currentBatches.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Now in rotation — {currentBatches.length}
            </p>
            <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 sm:gap-3">
              {currentBatches.map((batch) => (
                <Thumbnail
                  key={`current-${batch.slug}-${batch.batchNumber}`}
                  batch={batch}
                  isActive={active.slug === batch.slug && active.batchNumber === batch.batchNumber}
                  onSelect={() =>
                    setActiveIndex(
                      batches.findIndex(
                        (b) => b.slug === batch.slug && b.batchNumber === batch.batchNumber
                      )
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            Full archive — {batches.length}
          </p>
          <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 sm:gap-3">
            {batches.map((batch, i) => (
              <Thumbnail
                key={`${batch.slug}-${batch.batchNumber}`}
                batch={batch}
                isActive={i === activeIndex}
                onSelect={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumbnail({
  batch,
  isActive,
  onSelect,
}: {
  batch: Strain;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={batch.name}
      title={batch.name}
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg bg-neutral-800 transition-all",
        isActive
          ? "ring-2 ring-neutral-50 ring-offset-2 ring-offset-neutral-900"
          : "opacity-60 hover:opacity-100"
      )}
    >
      <Image src={batch.nugImage ?? batch.image} alt="" fill sizes="80px" className="object-contain" />
      {batch.isCurrent && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-lime-400 ring-2 ring-neutral-900"
        />
      )}
    </button>
  );
}
