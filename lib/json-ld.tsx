import { SITE_URL } from "@/lib/site";

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
