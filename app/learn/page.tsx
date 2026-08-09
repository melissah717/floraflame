import type { Metadata } from "next";
import { Breakdown } from "@/components/sections/breakdown";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Cannabinoids, terpenes, plant anatomy, and how different consumption methods actually feel — the parts that matter more than the number on the label.",
};

export default function LearnPage() {
  return <Breakdown />;
}
