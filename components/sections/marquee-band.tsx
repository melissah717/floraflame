import { Mark } from "@/components/mark";
import { ScrollMarquee } from "@/components/scroll-primitives";

/**
 * Dark full-bleed band between hero and drops.
 * First hard contrast break on the page — the light hero runs into
 * a solid dark slab, which resets the eye before the drops section.
 */
export function MarqueeBand() {
  const words = [
    "Living Soil",
    "No-Till",
    "Sun-Grown",
    "Small Batch",
    "Oakland, CA",
  ];

  return (
    <section className="relative bg-neutral-900 py-12 text-neutral-50 sm:py-16">
      <ScrollMarquee baseVelocity={2.5}>
        {words.map((w) => (
          <span key={w} className="flex items-center gap-10">
            <span className="font-display text-5xl leading-none tracking-[-0.01em] sm:text-7xl">
              {w}
            </span>
            <span className="text-3xl text-neutral-600 sm:text-5xl">✳</span>
          </span>
        ))}
      </ScrollMarquee>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-neutral-900 p-3">
          <Mark size={110} tone="light" />
        </div>
      </div>
    </section>
  );
}