import Link from "next/link";
import { Marquee } from "@/components/scroll-primitives";
import { NewsletterSignup } from "@/components/newsletter-signup";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200">
      {/* Marquee strip — same trick as the reference site. */}
      <div className="border-b border-neutral-200 py-6">
        <Marquee duration={40}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="font-display text-4xl text-neutral-300 sm:text-5xl"
            >
              Flora &amp; Flame — Living Soil — Oakland, CA —
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div id="subscribe" className="scroll-mt-24 lg:col-span-2">
            <p className="max-w-sm font-display text-2xl leading-snug">
              Drops sell out. Get notified first.
            </p>
            <NewsletterSignup />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Navigation
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["About", "/#about"],
                ["Drops", "/#drops"],
                ["Contact", "/#wholesale"],
                ["Find Us", "/#find-us"],
                ["Blog", "/blog"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="cursor-not-allowed text-neutral-300">
                Merch — soon
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Socials
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {["Instagram", "Weedmaps", "Leafly"].map((s) => (
                <li key={s}>
                  <span className="text-neutral-500">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-neutral-200 pt-6">
          {/* California Prop 65 — OEHHA safe-harbor warning for cannabis
              products. Required disclosure, not a stylistic choice. */}
          <p className="max-w-3xl text-xs leading-relaxed text-neutral-500">
            <span className="font-semibold text-neutral-700">WARNING:</span>{" "}
            This product can expose you to chemicals including marijuana
            smoke, which is known to the State of California to cause
            cancer, and delta-9-tetrahydrocannabinol (THC), which is known
            to the State of California to cause birth defects or other
            reproductive harm. For more information go to{" "}
            <a
              href="https://www.p65warnings.ca.gov"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-900"
            >
              www.P65Warnings.ca.gov
            </a>
            .
          </p>

          <div className="mt-6 flex flex-col gap-3 text-[11px] uppercase tracking-[0.18em] text-neutral-400 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} Flora &amp; Flame</span>
            <span>License # — C120000449-LIC · 21+ only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}