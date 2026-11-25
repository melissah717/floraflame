import type { Metadata } from "next";
import { Breakdown } from "@/components/sections/breakdown";
import { LearnMore } from "@/components/learn-more";
import { ArticleJsonLd } from "@/lib/json-ld";

const TITLE = "Cannabinoids & Terpenes Explained"
const DESCRIPTION =
  "THC, CBD, myrcene, limonene and more: Flora & Flame's guide to cannabinoids, terpenes and plant anatomy, and why they matter more than the THC number."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-leaf" },
}

export default function TheLeafPage() {
  return (
    <>
      <ArticleJsonLd path="/learn/the-leaf" headline={TITLE} description={DESCRIPTION} />
      <Breakdown />
      <LearnMore current="/learn/the-leaf" />
    </>
  );
}
