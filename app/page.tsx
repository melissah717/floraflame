import { Hero } from "@/components/sections/hero";
import { MarqueeBand } from "@/components/sections/marquee-band";
import { Drops } from "@/components/sections/drops";
import { About } from "@/components/sections/about";
import { Wholesale } from "@/components/sections/wholesale";
import { FindUs } from "@/components/sections/find-us";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/*
        Everything below the hero scrolls OVER it.
        - relative z-10 puts it above the sticky hero
        - bg-neutral-50 makes it opaque, so the hero doesn't show through
        Sections with their own bg (marquee band, wholesale) override it.
      */}
      <div className="relative z-10 bg-neutral-50">
        <About />
        <Drops />

        <Wholesale />
        <FindUs />
      </div>
    </>
  );
}