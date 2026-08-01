import { SPECTRUM_POSITIONS, type SpectrumPosition } from "@/lib/strains";

/**
 * Indica -> Hybrid -> Sativa color ramp, shared by the Drops rail/glow and
 * the archive's spectrum backdrop — kept in one place so both stay in
 * sync if the palette ever changes.
 */
export const INDICA = [139, 92, 246] as const; // violet
export const HYBRID = [255, 141, 61] as const; // flame orange
export const SATIVA = [163, 230, 53] as const; // flora lime

export const RGB = {
  indica: `rgb(${INDICA.join(" ")})`,
  hybrid: `rgb(${HYBRID.join(" ")})`,
  sativa: `rgb(${SATIVA.join(" ")})`,
};

function mix(a: readonly number[], b: readonly number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t)) as [
    number,
    number,
    number,
  ];
}

/** 0 = pure indica, 50 = pure hybrid, 100 = pure sativa. */
export function colorForHybrid(pct: number) {
  const [r, g, b] =
    pct <= 50 ? mix(INDICA, HYBRID, pct / 50) : mix(HYBRID, SATIVA, (pct - 50) / 50);
  return `rgb(${r} ${g} ${b})`;
}

// Rail position is relative, not measured — each spectrum bucket gets an
// evenly-spaced anchor, and strains sharing a bucket pile up at the same spot.
export function anchorForSpectrum(position: SpectrumPosition) {
  const index = SPECTRUM_POSITIONS.indexOf(position);
  return ((index + 0.5) / SPECTRUM_POSITIONS.length) * 100;
}
