import type { Metadata } from "next";
import { Reveal } from "@/components/scroll-primitives";
import { FarmChapters } from "@/components/sections/farm-chapters";

const TITLE = "The Farm"
const DESCRIPTION = "A look inside the Oakland grow, photos and video from the room."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-farm" },
  openGraph: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
  twitter: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
}

const GUTTER = "px-5 sm:px-8 lg:px-14";

export default function TheFarmPage() {
  return (
    <div className="bg-neutral-900 pb-24 pt-32 text-neutral-50 sm:pb-32 sm:pt-48">
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
    </div>
  );
}
