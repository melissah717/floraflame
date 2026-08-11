import type { Metadata } from "next";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";

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
    <div className={`bg-neutral-900 pb-24 pt-32 text-neutral-50 sm:pb-32 sm:pt-48 ${GUTTER}`}>
      <Reveal>
        <SectionLabel number="—" tone="light">
          Learn
        </SectionLabel>
        <h1 className="mt-5 max-w-[16ch] font-display uppercase leading-[0.88] tracking-[-0.03em] text-[clamp(2.5rem,7vw,6.5rem)]">
          Inside the grow
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
          Photos and video from the Oakland facility. The plants, the room,
          the hands actually doing the work.
        </p>
      </Reveal>

      <Reveal delay={0.08} className="mt-10 sm:mt-14">
        <div className="overflow-hidden rounded-[1.75rem] border border-neutral-800 bg-neutral-950 shadow-[0_0_0_1px_rgb(250_248_244_/_0.02)]">
          <video
            className="aspect-video w-full object-cover"
            src="https://res.cloudinary.com/g0mcdcfr/video/upload/v1786344108/DRONE_BOTTOMTOTOPPULL_dox1os.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        </div>
      </Reveal>
    </div>
  );
}
