import type { Metadata } from "next";
import { Breakdown } from "@/components/sections/breakdown";

export const metadata: Metadata = {
  title: "The Leaf",
  description:
    "Cannabinoids, terpenes, plant anatomy, and how different consumption methods actually feel. The stuff that matters more than the number on the label.",
};

export default function TheLeafPage() {
  return <Breakdown />;
}
