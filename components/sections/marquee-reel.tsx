"use client";

import { ScrollMarquee } from "@/components/scroll-primitives";

const WORDS = ["Living Soil", "By Hand", "No-Till", "Small Batch", "Oakland"];

/**
 * Full-bleed reel for the top of the footer. Footage plays behind giant type
 * and shows *through* the letters — a pure-black panel of white marquee text
 * is composited over the video with mix-blend-mode:multiply (white letters let
 * it through, black surround stays black). `isolate` keeps the blend inside
 * this section.
 *
 * Until a real Cloudinary URL is wired, the gradient background shows through
 * the letters instead of video — nothing breaks in the meantime.
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
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="https://res.cloudinary.com/g0mcdcfr/video/upload/f_auto,q_auto/reel.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative [mix-blend-mode:multiply]">
        <div className="bg-black py-12 sm:py-16">
          <ScrollMarquee baseVelocity={1}>
            {WORDS.map((w) => (
              <span key={w} className="flex items-center gap-[6vw] pr-[6vw]">
                <span className="font-display font-black uppercase leading-[0.82] tracking-[-0.02em] text-white text-[clamp(3.5rem,15vw,13rem)]">
                  {w}
                </span>
                <span className="text-white text-[clamp(1.8rem,6vw,5rem)] leading-none">
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