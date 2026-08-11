import type { Metadata } from "next";
import { Breakdown } from "@/components/sections/breakdown";

const TITLE = "The Leaf"
const DESCRIPTION =
  "Cannabinoids, terpenes, plant anatomy, and how different consumption methods actually feel. The stuff that matters more than the number on the label."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/the-leaf" },
  // openGraph/twitter titles don't pick up the root layout's `%s | Flora
  // & Flame` template the way the <title> tag does, so the site name is
  // spelled out here to keep social previews consistent with the tab title.
  openGraph: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
  twitter: { title: `${TITLE} | Flora & Flame`, description: DESCRIPTION },
}

export default function TheLeafPage() {
  return <Breakdown />;
}
