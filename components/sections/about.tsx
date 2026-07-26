import Image from "next/image";
import Link from "next/link";
import { ABOUT_IMAGE } from "@/lib/data";
import { Parallax, Reveal, SectionLabel } from "@/components/scroll-primitives";

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 border-t border-neutral-200 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left column pins while the right scrolls — pure CSS sticky. */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal>
            <SectionLabel number="01">About Us</SectionLabel>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="mt-8 max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-6xl">
              We grow in living soil, and we do not rush it.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <Link
              href="/about"
              className="group mt-10 inline-flex items-center gap-2 text-sm tracking-[0.02em]"
            >
              Get to know us
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="space-y-12">
          <Parallax speed={0.12} className="aspect-[3/4] bg-neutral-100">
            <div className="relative h-[125%] w-full">
              <Image
                src={ABOUT_IMAGE}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Parallax>

          <Reveal>
            <p className="text-lg leading-relaxed text-neutral-600">
              Placeholder paragraph. This is where the story about the farm
              goes — how it started, who runs it, and why the growing method
              matters to the people who end up smoking it.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="text-lg leading-relaxed text-neutral-600">
              Placeholder paragraph. A second block explaining living soil in
              plain language, without turning into a lecture. Two or three
              sentences is plenty here.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-neutral-200 pt-10 sm:grid-cols-3">
              {[
                { k: "Founded", v: "2017" },
                { k: "Based in", v: "Oakland, CA" },
                { k: "Method", v: "Living Soil" },
              ].map(({ k, v }) => (
                <div key={k}>
                  <dt className="text-xs tracking-[0.04em] text-neutral-500">
                    {k}
                  </dt>
                  <dd className="mt-2 font-display text-2xl">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}