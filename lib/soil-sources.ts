/**
 * Sources cited on /learn/the-soil. Lives outside the page component so
 * the page's footnote list and its Article structured data (the
 * `citation` field, in app/(site)/learn/the-soil/page.tsx) read the same
 * list and can't drift apart.
 */

/** Numbered to match the footnote markers: 1 in the opening statement,
 * 2 in the cover crop chapter, 3 in the mulch chapter. */
export const SOIL_SOURCES = [
  {
    text: "USDA Natural Resources Conservation Service. Principles for High Functioning Soils.",
    href: "https://www.nrcs.usda.gov/sites/default/files/2023-07/NRCS-Principles-for-High-Functioning-Soils-Factsheet.pdf",
  },
  {
    text: "Sustainable Agriculture Research and Education (SARE). Benefits of Cover Crops, in Managing Cover Crops Profitably, 3rd edition.",
    href: "https://sare.org/publications/managing-cover-crops-profitably/benefits-of-cover-crops",
  },
  {
    text: "University of Minnesota Extension. Mulching for soil and garden health.",
    href: "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/mulching-for-soil-and-garden-health",
  },
]
