import { Reveal, SectionLabel } from "@/components/scroll-primitives";

export function FindUs() {
  return (
    <section
      id="find-us"
      className="scroll-mt-20 bg-neutral-100 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel number="04">Find Us</SectionLabel>
        </Reveal>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Reveal delay={0.05}>
              <h2 className="max-w-[14ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
                Where to find the flower.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 space-y-8">
                {[
                  { k: "Address", v: "000 Placeholder St\nOakland, CA 00000" },
                  { k: "Hours", v: "Mon–Fri, 00:00–00:00" },
                  { k: "Email", v: "hello@placeholder.com" },
                ].map(({ k, v }) => (
                  <div key={k} className="border-b border-neutral-200 pb-6">
                    <p className="text-xs tracking-[0.04em] text-neutral-500">
                      {k}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-lg leading-relaxed">
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Mapbox goes here. Placeholder block keeps the layout honest. */}
          <Reveal delay={0.08}>
            <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-neutral-300 bg-neutral-50">
              <span className="text-xs tracking-[0.04em] text-neutral-500">
                Mapbox embed
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}