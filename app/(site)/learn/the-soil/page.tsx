import type { Metadata } from "next";
import { LivingSoil } from "@/components/sections/living-soil";
import { LearnMore } from "@/components/learn-more";

const TITLE = "No-Till Living Soil, Explained"
const DESCRIPTION =
  "How no-till living soil works: microbes, fungi, worms, compost and cover crops feeding the plant instead of synthetic nutrients, and why it shows up in the flower."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-soil" },
}

export default function TheSoilPage() {
  return (
    <>
      <LivingSoil />
      <LearnMore current="/learn/the-soil" />
    </>
  );
}
