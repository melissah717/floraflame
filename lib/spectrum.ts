import { SPECTRUM_POSITIONS, type SpectrumPosition } from "@/lib/strains";

/**
 * Indica -> Hybrid -> Sativa color ramp, shared by the Drops rail/glow and
 * the archive's spectrum backdrop — kept in one place so both stay in
 * sync if the palette ever changes.
 */
export const INDICA = [135, 54, 148] as const; // #873694
export const HYBRID = [251, 176, 58] as const; // #FBB03A
export const SATIVA = [79, 142, 69] as const; // #4F8E45
export const BRAND_RED = [237, 31, 39] as const; // #ED1F27
export const BRAND_SLATE = [71, 81, 103] as const; // #475167

export const RGB = {
  indica: `rgb(${INDICA.join(" ")})`,
  hybrid: `rgb(${HYBRID.join(" ")})`,
  sativa: `rgb(${SATIVA.join(" ")})`,
  red: `rgb(${BRAND_RED.join(" ")})`,
  slate: `rgb(${BRAND_SLATE.join(" ")})`,
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
