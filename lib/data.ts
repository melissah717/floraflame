/**
 * Placeholder content. Swap for Sanity queries later —
 * keep the shapes the same and the components won't need to change.
 */

export type Drop = {
  slug: string;
  name: string;
  lineage: string;
  category: string;
  status: "available" | "upcoming" | "sold out";
  year: string;
  image: string;
  blurb: string;
};

// picsum "seed" keeps each placeholder stable between reloads
const ph = (seed: string, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}?grayscale`;

export const DROPS: Drop[] = [
  {
    slug: "placeholder-one",
    name: "Placeholder One",
    lineage: "Lorem × Ipsum",
    category: "Indoor · Living Soil",
    status: "available",
    year: "2026",
    image: ph("ff-drop-1"),
    blurb:
      "Placeholder description for the first drop. Two or three lines about how it was grown, what it smells like, and when it landed.",
  },
  {
    slug: "placeholder-two",
    name: "Placeholder Two",
    lineage: "Dolor × Sit",
    category: "Sun-Grown · Living Soil",
    status: "available",
    year: "2026",
    image: ph("ff-drop-2"),
    blurb:
      "Placeholder description for the second drop. Replace with real tasting notes and cultivation detail once the copy is written.",
  },
  {
    slug: "placeholder-three",
    name: "Placeholder Three",
    lineage: "Amet × Consectetur",
    category: "Indoor · Living Soil",
    status: "upcoming",
    year: "2026",
    image: ph("ff-drop-3"),
    blurb:
      "Placeholder description for the third drop. This one is marked upcoming so you can see how the status badge renders.",
  },
];

export const HERO_IMAGES = [
  ph("ff-hero-1", 800, 1000),
  ph("ff-hero-2", 800, 1000),
  ph("ff-hero-3", 800, 1000),
  ph("ff-hero-4", 800, 1000),
  ph("ff-hero-5", 800, 1000),
];

export const ABOUT_IMAGE = ph("ff-about", 1200, 1600);
export const WHOLESALE_IMAGE = ph("ff-wholesale", 1400, 900);