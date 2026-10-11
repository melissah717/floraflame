import type { Metadata } from "next";
import { FindUs } from "@/components/sections/find-us";
import { fetchStockists } from "@/lib/stockists";
import { BreadcrumbJsonLd } from "@/lib/json-ld";
import { StockistDirectory } from "@/components/stockist-directory";

/**
 * /find-us — the same map and search as the home page section, at its own
 * address. A "#find-us" link is just the home page as far as Google is
 * concerned; a real page can rank on its own for "where to buy" searches
 * with its own title and description.
 */

// Same cadence as the home page: re-read the stockist sheet at most hourly.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const stockists = await fetchStockists();
  const count = stockists.length;
  const title = "Find Us · Dispensaries Near You";
  const description = `Find Flora & Flame living soil cannabis at ${count} licensed dispensaries across California. Search by city or zip, or use your location to see the closest shops.`;

  return {
    title,
    description,
    alternates: { canonical: "/find-us" },
  };
}

export default function FindUsPage() {
  // pt-20 clears the fixed nav; the section brings its own padding below.
  return (
    <div className="bg-neutral-900 pt-20 text-neutral-50">
      <BreadcrumbJsonLd trail={[["Find Us", "/find-us"]]} />
      <FindUs headingLevel="h1" />
      <StockistDirectory />
    </div>
  );
}
