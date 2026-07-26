"use client";
 
import Image from "next/image";
import { useState } from "react";
import { WHOLESALE_IMAGE } from "@/lib/data";
import { Parallax, Reveal, SectionLabel } from "@/components/scroll-primitives";
import { Button } from "@/components/ui/button";
 
/**
 * Dark section. Second contrast break — sits between the light About
 * and the light Find Us, so the page reads light / dark / light / dark / light.
 */
export function Wholesale() {
  const [sent, setSent] = useState(false);
 
  return (
    <section
      id="wholesale"
      className="scroll-mt-20 bg-neutral-900 px-5 py-24 text-neutral-50 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel number="03" tone="light">
            Submit a Request
          </SectionLabel>
        </Reveal>
 
        <Reveal delay={0.05}>
          <h2 className="mt-8 max-w-[18ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-6xl">
            Placeholder something here
          </h2>
        </Reveal>
 
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Parallax speed={0.1} className="aspect-[4/3] bg-neutral-800">
              <div className="relative h-[120%] w-full">
                <Image
                  src={WHOLESALE_IMAGE}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Parallax>
 
            <p className="mt-8 text-lg leading-relaxed text-neutral-400">
              Placeholder paragraph about wholesale. What buyers should expect,
              rough availability, and what to include when they reach out.
            </p>
          </Reveal>
 
          <Reveal delay={0.08}>
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Name" />
                <Field label="Business" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Email" type="email" />
                <Field label="License #" />
              </div>
 
              <div>
                <label className="text-xs tracking-[0.04em] text-neutral-400">
                  Message
                </label>
                {/* Plain textarea — shadcn's has light-mode defaults that
                    fight the dark section. Not worth the override here. */}
                <textarea
                  rows={5}
                  placeholder="What are you looking for?"
                  className="mt-2 w-full resize-none border-0 border-b border-neutral-700 bg-transparent px-0 py-2 text-neutral-50 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-300"
                />
              </div>
 
              <Button
                onClick={() => setSent(true)}
                size="lg"
                className="mt-4 w-full rounded-full bg-neutral-50 py-6 text-base font-normal text-neutral-900 hover:bg-neutral-200 sm:w-auto sm:px-10"
              >
                {sent ? "Thanks — we'll be in touch" : "Send enquiry"}
              </Button>
 
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
 
function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <div>
      <label className="text-xs tracking-[0.04em] text-neutral-400">
        {label}
      </label>
      <input
        type={type}
        className="mt-2 w-full border-0 border-b border-neutral-700 bg-transparent px-0 py-2 text-neutral-50 outline-none transition-colors focus:border-neutral-300"
      />
    </div>
  );
}
 
