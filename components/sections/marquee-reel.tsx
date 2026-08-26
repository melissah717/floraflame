"use client";

import { ScrollMarquee } from "@/components/scroll-primitives";

const WORDS = ["Living Soil", "By Hand", "No-Till", "Small Batch", "Oakland"];

/**
 * Full-bleed reel for the top of the footer. Big letters, gradient (later:
 * video) showing through them via mix-blend-mode:multiply on a pure-black
 * text panel. `isolate` keeps the blend inside this section.
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
        <div className="bg-black py-14 sm:py-16">
          <ScrollMarquee baseVelocity={3}>
            {WORDS.map((w) => (
              <span key={w} className="flex items-center gap-[6vw] pr-[6vw]">
                <span className="font-display font-black uppercase leading-[0.82] tracking-[-0.02em] text-white text-[clamp(4.5rem,22vw,13rem)]">
                  {w}
                </span>
                <span className="text-white text-[clamp(2.5rem,8vw,5rem)] leading-none">
                  ✳
                </span>
              </span>
            ))}
          </ScrollMarquee>
        </div>
      </div>
    </section>
  );
}