import type { Metadata } from "next";
import { TheSoil } from "@/components/sections/the-soil";
import { LearnMore } from "@/components/learn-more";
import { ArticleJsonLd } from "@/lib/json-ld";
import { SOIL_SOURCES } from "@/lib/soil-sources";

const TITLE = "Indoor No-Till Living Soil, Explained"
const DESCRIPTION =
  "How Flora & Flame's indoor no-till living soil works: compost, worms and fungi, a living cover crop and a mulch layer, in beds reused harvest after harvest."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-soil" },
}

export default function TheSoilPage() {
  return (
    <>
      <ArticleJsonLd
        path="/learn/the-soil"
        headline={TITLE}
        description={DESCRIPTION}
        image="/soil/bed.jpg"
        citation={SOIL_SOURCES}
      />
      <TheSoil />
      <LearnMore current="/learn/the-soil" />
    </>
  );
}
