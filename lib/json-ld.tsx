import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Serializes structured data for a `<script type="application/ld+json">`.
 * JSON.stringify alone leaves `<` intact, so a value containing
 * "</script>" (say, a blog title typed in the admin) could close the tag
 * early and inject markup. Escaping it as < is still valid JSON.
 */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * BreadcrumbList for a page below the home page. Pass [name, path] pairs
 * from the top down, ending with the current page; Home is prepended.
 * Lets Google show "floraandflame.co › Learn › The Soil" in results
 * instead of a raw URL.
 */
export function breadcrumbs(trail: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"] as const, ...trail].map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    })),
  };
}

/** Renders breadcrumbs() as a script tag, for server components. */
export function BreadcrumbJsonLd({ trail }: { trail: [string, string][] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs(trail)) }}
    />
  );
}

/**
 * Article schema for the editorial Learn pages. Ties the page to the
 * brand (author and publisher both point at the Organization defined on
 * the home page) and, where a page cites sources, lists them as
 * `citation`. Dates are left out on purpose: these pages have no real
 * publish date, and an invented one is worse than none.
 */
export function ArticleJsonLd({
  path,
  headline,
  description,
  image,
  citation,
}: {
  path: string;
  headline: string;
  description: string;
  image?: string;
  citation?: { text: string; href: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    ...(image ? { image: image.startsWith("http") ? image : `${SITE_URL}${image}` } : {}),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
    },
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: "en-US",
    ...(citation?.length
      ? {
          citation: citation.map((c) => ({
            "@type": "CreativeWork",
            name: c.text,
            url: c.href,
          })),
        }
      : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
