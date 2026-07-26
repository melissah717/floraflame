/**
 * Placeholder classification. Swap `hybrid` for real lab/lineage data
 * once it exists — the spectrum carousel just needs a 0–100 number per
 * strain, where 0 = pure indica and 100 = pure sativa.
 */

export type Strain = {
  slug: string;
  name: string;
  image: string;
  /** Position on the indica → sativa spectrum. 0 = pure indica, 100 = pure sativa. */
  hybrid: number;
  /** THC, percent by dry weight. */
  thc: number;
  category: string;
  /** Flavor/effect keywords, shown as chips. */
  tags: string[];
  /** One or two sentences, revealed on demand rather than shown up front. */
  description: string;
};

export const STRAINS: Strain[] = [
  {
    slug: "crunch-berries",
    name: "Crunch Berries",
    image: "/Crunch_Berries.png",
    hybrid: 8,
    thc: 24,
    category: "Indoor · Living Soil",
    tags: ["Berry", "Dessert", "Relaxing"],
    description:
      "A dessert-leaning indica with a jammy berry nose and a slow, heavy-lidded body high built for the end of the day.",
  },
  {
    slug: "donny-burger",
    name: "Donny Burger",
    image: "/Donny_Burger.png",
    hybrid: 35,
    thc: 22,
    category: "Indoor · Living Soil",
    tags: ["Savory", "Gassy", "Heavy"],
    description:
      "Burger lineage through and through — funky and savory, built for couch-lock rather than conversation.",
  },
  {
    slug: "gg4",
    name: "GG4",
    image: "/GG4.png",
    hybrid: 35,
    thc: 50,
    category: "Indoor · Living Soil",
    tags: ["Diesel", "Earthy", "Potent"],
    description:
      "The strain that needs no introduction: sticky, diesel-heavy, and reliably one of the stronger jars on the shelf.",
  },
  {
    slug: "moonbow",
    name: "Moonbow",
    image: "/Moonbow.png",
    hybrid: 35,
    thc: 23,
    category: "Indoor · Living Soil",
    tags: ["Fruity", "Balanced", "Uplifting"],
    description:
      "A true middle-of-the-road hybrid — bright fruit up front, with a calm, even effect that doesn't tip too far either way.",
  },
  {
    slug: "jammerz",
    name: "Jammerz",
    image: "/Jammerz.png",
    hybrid: 63,
    thc: 25,
    category: "Indoor · Living Soil",
    tags: ["Tropical", "Sweet", "Social"],
    description:
      "Sweet and tropical with just enough lift to keep a conversation going without losing the thread.",
  },
  {
    slug: "guavanade",
    name: "Guavanade",
    image: "/Guavanade.png",
    hybrid: 76,
    thc: 21,
    category: "Indoor · Living Soil",
    tags: ["Citrus", "Tart", "Energizing"],
    description:
      "Guava and lemonade in name and in nose — tart, juicy, and leaning toward the brighter, more energetic side of the shelf.",
  },
  {
    slug: "super-silver-haze",
    name: "Super Silver Haze",
    image: "/Super_Silver_Haze.png",
    hybrid: 91,
    thc: 19,
    category: "Indoor · Living Soil",
    tags: ["Haze", "Sativa", "Cerebral"],
    description:
      "A classic haze — sharp and cerebral, built for daytime, with the lineage to back up the name.",
  },
];
