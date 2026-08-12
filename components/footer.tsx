import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { PrivacyPolicyModal, TermsModal } from "@/components/legal-modals";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800">
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Socials
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["Instagram", "https://instagram.com/floraandflameca"],
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
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-neutral-800 pt-6">
          {/* California Prop 65 — OEHHA safe-harbor warning for cannabis
              products. Required disclosure, not a stylistic choice. */}
          <p className="max-w-3xl text-xs leading-relaxed text-neutral-400">
            <span className="font-semibold text-neutral-200">WARNING:</span>{" "}
            This product can expose you to chemicals including marijuana
            smoke, which is known to the State of California to cause
            cancer, and delta-9-tetrahydrocannabinol (THC), which is known
            to the State of California to cause birth defects or other
            reproductive harm. For more information go to{" "}
            <a
              href="https://www.p65warnings.ca.gov"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-50"
            >
              www.P65Warnings.ca.gov
            </a>
            .
          </p>

          <div className="mt-6 flex flex-col gap-4 text-[11px] uppercase tracking-[0.18em] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Flora &amp; Flame</span>
            <div className="flex gap-5">
              <PrivacyPolicyModal />
              <TermsModal />
            </div>
            <span>License #C120000449-LIC · 21+ only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
