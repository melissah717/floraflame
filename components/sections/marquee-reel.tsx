"use client";

import { ScrollMarquee } from "@/components/scroll-primitives";

const WORDS = ["Living Soil", "By Hand", "No-Till", "Small Batch", "Oakland"];

/**
 * Full-bleed reel for the top of the footer. Big letters, gradient (later:
 * video) showing through them via mix-blend-mode:multiply on a pure-black
 * text panel. `isolate` keeps the blend inside this section.
 *
 * Tuned for calmer, more refined feel:
 *   – baseVelocity slowed 2 → 0.6 (roughly 3× slower)
 *   – Text scaled down ~25% and font-black → font-bold (less shouty)
 *   – Gaps tightened
 *   – Separator swapped from bulky ✳ to a slim brand-appropriate ✿
 *   – Separator dimmed via opacity so it reads as a marker, not a shape
 */
export function MarqueeReel() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        background:
          "linear-gradient(115deg,#12251a 0%,#241a2e 45%,#3a2016 75%,#12251a 100%)",
      }}
    >
      {/* Real footage goes here once uploaded. Left commented so a broken
          <video> element doesn't render a black frame over the gradient. */}
      {/*
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay muted loop playsInline
      >
        <source
          src="https://res.cloudinary.com/g0mcdcfr/video/upload/f_auto,q_auto/reel.mp4"
          type="video/mp4"
        />
      </video>
      */}

      <div className="relative [mix-blend-mode:multiply]">
        <div className="bg-black py-10 sm:py-14">
          <ScrollMarquee baseVelocity={0.6}>
            {WORDS.map((w) => (
              <span key={w} className="flex items-center gap-[3vw] pr-[3vw]">
                <span className="font-display font-bold uppercase leading-[0.85] tracking-[-0.015em] text-white text-[clamp(3.5rem,16vw,10rem)]">
                  {w}
                </span>
                <span className="text-white text-[clamp(1.25rem,3.5vw,2rem)] leading-none opacity-60">
                  ✿
                </span>
              </span>
            ))}
          </ScrollMarquee>
        </div>
      </div>
    </section>
  );
}