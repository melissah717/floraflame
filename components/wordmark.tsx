/**
 * Wordmark — the "Flora & Flame" logo rendered as a CSS mask so its color
 * is controllable via any Tailwind background color (or a hex/rgb via
 * arbitrary value). The SVG's original fill is ignored — the visible color
 * comes from the container's background-color, which the mask cuts a
 * wordmark-shaped hole out of.
 *
 * This means you can drop this into nav, hero, footer, anywhere — and get
 * a different color in each place without touching the SVG file.
 *
 * Usage:
 *   <Wordmark className="h-8 w-40" color="bg-neutral-50" />
 *   <Wordmark className="h-16 w-96" color="bg-[#e0d2a3]" />
 *   <Wordmark className="h-12 w-64" color="bg-neutral-500" />
 *
 * Sizing: pass explicit h-* and w-* in className (or use aspect-ratio).
 * The mask-image auto-scales to fit via `contain`.
 */

/**
 * The mask is a transparent PNG that Cloudinary rasterises from the SVG
 * (f_png), NOT the SVG itself. The source SVG is a Canva export whose
 * lettering is an embedded bitmap cut out by SVG <mask>/<filter> elements.
 * Chrome resolves that when the file is used as a CSS mask; iOS Safari
 * doesn't, so it ignored the mask and painted the whole box solid white.
 * A plain PNG alpha channel works as a mask everywhere. 1200px wide covers
 * the largest use (≈240px) at 3× retina with room to spare.
 */
const WORDMARK_URL =
  "https://res.cloudinary.com/g0mcdcfr/image/upload/f_png,w_1200/v1785517828/text-logo.svg";

export function Wordmark({
  className = "",
  color = "bg-neutral-50",
}: {
  /** Size classes (h-* w-*) plus anything else. */
  className?: string;
  /** Tailwind background color class or arbitrary value. Default: white. */
  color?: string;
}) {
  return (
    <div
      role="img"
      aria-label="Flora & Flame"
      className={`${color} ${className}`}
      style={{
        maskImage: `url('${WORDMARK_URL}')`,
        WebkitMaskImage: `url('${WORDMARK_URL}')`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
      }}
    />
  );
}