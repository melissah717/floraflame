import type { Metadata } from "next";
import { LivingSoil } from "@/components/sections/living-soil";

export const metadata: Metadata = {
  title: "The Soil",
  description:
    "No-till. No synthetics. No pesticides. It all comes down to one idea: living soil feeds the microbes that feed the plant.",
};

export default function TheSoilPage() {
  return <LivingSoil />;
}
