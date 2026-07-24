import Link from "next/link";
import { Marquee } from "@/components/scroll-primitives";

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
          <div className="lg:col-span-2">
            <p className="max-w-sm font-display text-2xl leading-snug">
              Drops sell out. Get notified first.
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Navigation
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["Drops", "/#drops"],
                ["About", "/#about"],
                ["Work With Us", "/#wholesale"],
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

        <div className="mt-16 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-[11px] uppercase tracking-[0.18em] text-neutral-400 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Flora &amp; Flame</span>
          <span>License # — placeholder · 21+ only</span>
        </div>
      </div>
    </footer>
  );
}