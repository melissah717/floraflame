import type { Metadata } from "next";
import { LivingSoil } from "@/components/sections/living-soil";

const TITLE = "The Soil"
const DESCRIPTION =
  "No-till. No synthetics. No pesticides. It all comes down to one idea: living soil feeds the microbes that feed the plant."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-soil" },
  openGraph: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
  twitter: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
}

export default function TheSoilPage() {
  return <LivingSoil />;
}
