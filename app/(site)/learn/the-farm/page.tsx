import type { Metadata } from "next";
import { Reveal } from "@/components/scroll-primitives";
import { FarmChapters } from "@/components/sections/farm-chapters";
import { LearnMore } from "@/components/learn-more";

const TITLE = "Inside Our Oakland Cannabis Farm"
const DESCRIPTION =
  "Photos and video from inside the Flora & Flame grow in Oakland, California: the rooms, the plants and the hands that grow and trim every small batch."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-farm" },
}

const GUTTER = "px-5 sm:px-8 lg:px-14";

export default function TheFarmPage() {
  return (
    <div className="bg-neutral-900 pt-32 text-neutral-50 sm:pt-48">
      <Reveal className={GUTTER}>
        <h1 className="max-w-[16ch] font-display uppercase leading-[0.88] tracking-[-0.03em] text-[clamp(2.5rem,7vw,6.5rem)]">
          Inside the grow
        </h1>
      </Reveal>

      {/* Full-bleed on purpose — the chapters own the whole viewport. Not
          wrapped in <Reveal>: the stage is position:sticky and shouldn't
          sit under an animated transform. */}
      <div className="mt-10 sm:mt-14">
        <FarmChapters />
      </div>
      <LearnMore current="/learn/the-farm" />
    </div>
  );
}
