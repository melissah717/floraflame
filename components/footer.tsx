import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { MarqueeReel } from "@/components/sections/marquee-reel";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800">
      {/* Full-bleed reel sits above the footer content. */}
      <MarqueeReel />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div id="subscribe" className="scroll-mt-24 lg:col-span-2">
            <p className="max-w-sm font-display text-2xl leading-snug">
              Drops sell out. Get notified first.
            </p>
            <NewsletterSignup />
          </div>

          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-neutral-400">
              Navigation
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {/* Plain, crawlable links to each home-page section, with the
                  same labels as the section headings. Google builds the
                  "sitelinks" pills under a search result from links like
                  these, so keep the wording short and stable. */}
              {[
                ["Home", "/"],
                ["Latest Drops", "/#drops"],
                ["About", "/#about"],
                ["Find Us", "/find-us"],
                ["Contact", "/#contact"],
                ["Strains", "/strains"],
                ["Learn", "/learn"],
                ["The Knowledge", "/learn/the-knowledge"],
                ["Merch", "/merch"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-neutral-400 transition-colors hover:text-neutral-50"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-neutral-400">
              Socials
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["Instagram", "https://www.instagram.com/floraandflameca/"],
                ["YouTube", "https://www.youtube.com/@FloraFlameCA"],
                ["Weedmaps", "https://weedmaps.com/brands/flora-flame"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 transition-colors hover:text-neutral-50"
                  >
                    {label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-neutral-800 pt-6">
          {/*
            California Prop 65 — OEHHA's safe-harbor warning for cannabis
            smoke and THC (27 CCR § 25607.39, in force since Oct 2022). The
            wording, the bold all-caps WARNING and the yellow triangle are
            all part of the safe harbor; don't paraphrase or restyle them.
          */}
          <p className="max-w-3xl text-xs leading-relaxed text-neutral-300">
            <svg
              viewBox="0 0 24 21"
              role="img"
              aria-label="Warning symbol"
              className="mr-1.5 inline-block h-3.5 w-4 -translate-y-px align-middle"
            >
              <path d="M12 1 23 20H1Z" fill="#facc15" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 7.5v6" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="16.6" r="1.25" fill="#000" />
            </svg>
            <strong className="font-bold text-neutral-50">WARNING:</strong>{" "}
            Smoking cannabis increases your cancer risk and during pregnancy
            exposes your child to delta-9-THC and other chemicals that can
            affect your child&apos;s birthweight, behavior, and learning
            ability. For more information go to{" "}
            <a
              href="https://www.p65warnings.ca.gov/cannabis"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-50"
            >
              www.P65Warnings.ca.gov/cannabis
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>

          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-neutral-400">
            For use only by adults 21 and older. Keep out of reach of
            children. Flora &amp; Flame products are sold only through
            state-licensed California retailers; we don&apos;t sell or ship
            cannabis online.
          </p>

          <div className="mt-6 flex flex-col gap-4 text-[13px] uppercase tracking-[0.18em] text-neutral-400 lg:flex-row lg:items-center lg:justify-between">
            <span>© {new Date().getFullYear()} Flora &amp; Flame</span>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                ["Privacy Policy", "/privacy"],
                ["Terms", "/terms"],
                ["Accessibility", "/accessibility"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-neutral-50"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <span>License #C120000449-LIC · 21+ only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}