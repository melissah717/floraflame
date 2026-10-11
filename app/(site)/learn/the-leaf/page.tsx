import type { Metadata } from "next";
import { Breakdown } from "@/components/sections/breakdown";
import { LearnMore } from "@/components/learn-more";

const TITLE = "Cannabinoids & Terpenes Explained"
const DESCRIPTION =
  "THC, CBD, myrcene, limonene and more: an interactive guide to cannabinoids, terpenes and cannabis plant anatomy, and why they matter more than the number on the label."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-leaf" },
}

export default function TheLeafPage() {
  return (
    <>
      <Breakdown />
      <LearnMore current="/learn/the-leaf" />
    </>
  );
}
