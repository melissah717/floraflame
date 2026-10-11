import type { ReactNode } from "react";

/**
 * Shared shell for the legal pages (/privacy, /terms, /accessibility).
 * Server-rendered plain text so they're crawlable, linkable from emails and
 * readable without JavaScript.
 */
export function LegalPage({
  title,
  effective,
  children,
}: {
  title: string;
  /** Shown as "Effective date …". */
  effective: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 text-neutral-50 sm:px-8 sm:pt-40">
      <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.95] tracking-[-0.02em]">
        {title}
      </h1>
      <p className="mt-4 text-sm text-neutral-400">Effective date: {effective}</p>
      <div className="mt-10 space-y-8 text-base leading-relaxed text-neutral-300">{children}</div>
    </article>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-neutral-50">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

/** Address for privacy and legal requests. */
export const LEGAL_EMAIL = "floraflameca@gmail.com";

export function LegalEmail() {
  return (
    <a href={`mailto:${LEGAL_EMAIL}`} className="underline underline-offset-4 hover:text-neutral-50">
      {LEGAL_EMAIL}
    </a>
  );
}
