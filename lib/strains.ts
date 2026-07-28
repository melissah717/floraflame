/**
 * Where a strain sits on the indica → sativa spectrum, relative to the
 * others — not a lab-measured ratio, just a qualitative bucket.
 */
export const SPECTRUM_POSITIONS = [
  "Indica",
  "Indica-Leaning Hybrid",
  "Balanced Hybrid",
  "Sativa-Leaning Hybrid",
  "Sativa",
] as const;

export type SpectrumPosition = (typeof SPECTRUM_POSITIONS)[number];

export type Strain = {
  slug: string;
  name: string;
  image: string;
  spectrum: SpectrumPosition;
  category: string;
  /** Flavor/effect keywords, shown as chips. */
  tags: string[];
  /** One or two sentences, revealed on demand rather than shown up front. */
  description: string;
  /** Cross, e.g. "Zkittlez x Do-Si-Dos". Not all strains have this on file. */
  genetics?: string;
  /** Dominant terpenes, in descending order. */
  terpenes?: string[];
  /** When it's best used, e.g. "Evening" or "Before bed". */
  idealTime?: string;
};

export const STRAINS: Strain[] = [
  {
    slug: "crunch-berries",
    name: "Crunch Berries",
    image: "/Crunch_Berries.png",
    spectrum: "Indica",
    category: "Indoor · Living Soil",
    tags: ["Berry", "Dessert", "Relaxing"],
    description:
      "A dessert-leaning indica with a jammy berry nose and a slow, heavy-lidded body high built for the end of the day.",
    genetics: "Gassius Clay x Billy Kimber x Sweet Retreat",
    terpenes: ["Pinene", "Caryophyllene", "Myrcene", "Humulene", "Limonene"],
    idealTime: "Evenings",
  },
  {
    slug: "donny-burger",
    name: "Donny Burger",
    image: "/Donny_Burger.png",
    spectrum: "Indica-Leaning Hybrid",
    category: "Indoor · Living Soil",
    tags: ["Savory", "Gassy", "Heavy"],
    description:
      "Burger lineage through and through — funky and savory, built for couch-lock rather than conversation.",
    genetics: "GMO x Han Solo Burger",
    terpenes: [
      "Pinene",
      "Caryophyllene",
      "Limonene",
      "Myrcene",
      "Humulene",
      "Linalool",
    ],
    idealTime: "Before bed",
  },
  {
    slug: "gg4",
    name: "GG4",
    image: "/GG4.png",
    spectrum: "Indica",
    category: "Indoor · Living Soil",
    tags: ["Diesel", "Earthy", "Potent"],
    description:
      "The strain that needs no introduction: sticky, diesel-heavy, and reliably one of the stronger jars on the shelf.",
    genetics: "Chem's Sister x Sour Dubb x Chocolate Diesel",
    terpenes: ["Caryophyllene", "Myrcene", "Limonene", "Pinene", "Humulene"],
    idealTime: "Before bed, weekends",
  },
  {
    slug: "moonbow",
    name: "Moonbow",
    image: "/Moonbow.png",
    spectrum: "Indica-Leaning Hybrid",
    category: "Indoor · Living Soil",
    tags: ["Fruity", "Balanced", "Uplifting"],
    description:
      "A true middle-of-the-road hybrid — bright fruit up front, with a calm, even effect that doesn't tip too far either way.",
    genetics: "Zkittlez x Do-Si-Dos",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene", "Linalool"],
    idealTime: "Evening",
  },
  {
    slug: "jammerz",
    name: "Jammerz",
    image: "/Jammerz.png",
    spectrum: "Sativa-Leaning Hybrid",
    category: "Indoor · Living Soil",
    tags: ["Tropical", "Sweet", "Social"],
    description:
      "Sweet and tropical with just enough lift to keep a conversation going without losing the thread.",
  },
  {
    slug: "guavanade",
    name: "Guavanade",
    image: "/Guavanade.png",
    spectrum: "Indica-Leaning Hybrid",
    category: "Indoor · Living Soil",
    tags: ["Citrus", "Tart", "Energizing"],
    description:
      "Guava and lemonade in name and in nose — tart, juicy, and leaning toward the brighter, more energetic side of the shelf.",
    genetics: "Gelonade x Sherb BX",
    terpenes: ["Limonene", "Terpinolene", "Caryophyllene", "Linalool"],
    idealTime: "Evening, after work",
  },
  {
    slug: "super-silver-haze",
    name: "Super Silver Haze",
    image: "/Super_Silver_Haze.png",
    spectrum: "Sativa",
    category: "Indoor · Living Soil",
    tags: ["Haze", "Sativa", "Cerebral"],
    description:
      "A classic haze — sharp and cerebral, built for daytime, with the lineage to back up the name.",
    genetics: "Skunk x Northern Lights x Haze",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene", "Pinene"],
    idealTime: "Mornings",
  },
];
