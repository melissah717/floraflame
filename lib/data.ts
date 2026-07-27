/**
 * Placeholder content. Swap for Sanity queries later —
 * keep the shapes the same and the components won't need to change.
 */

// picsum "seed" keeps each placeholder stable between reloads
const ph = (seed: string, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}?grayscale`;

export const HERO_IMAGES = [
  ph("ff-hero-1", 800, 1000),
  ph("ff-hero-2", 800, 1000),
  ph("ff-hero-3", 800, 1000),
  ph("ff-hero-4", 800, 1000),
  ph("ff-hero-5", 800, 1000),
];

export const ABOUT_IMAGE = ph("ff-about", 1200, 1600);