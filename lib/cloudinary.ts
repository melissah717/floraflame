/**
 * Cloudinary delivery helpers.
 *
 * WHY THIS EXISTS — the short version is 2.9 MB vs 335 KB.
 *
 * Strain photos were stored and served as their raw upload URL:
 *
 *   https://res.cloudinary.com/g0mcdcfr/image/upload/v1785465450/Crunch_Berries_uw9pkj.png
 *
 * That delivers the full-size PNG. The same asset with `f_auto,q_auto` is
 * an eighth of the size, because Cloudinary picks AVIF/WebP per browser and
 * tunes quality per image. Every other Cloudinary asset on the site already
 * asks for that (see components/sections/about.tsx); the strain and blog
 * photos were the ones that didn't.
 *
 * Applied in the data layer — lib/strains.ts and lib/blog.ts — rather than
 * at each <Image>, so every consumer gets it, including metadata, JSON-LD,
 * and anything added later. A URL pasted by hand into the admin picks it up
 * on read without anyone having to remember.
 */

const UPLOAD_SEGMENT = "/image/upload/";

/**
 * `f_auto` = best format the requesting browser accepts.
 * `q_auto`  = per-image quality, perceptually tuned.
 *
 * If product shots ever need to be pristine, `q_auto:best` is the knob —
 * bigger files, less aggressive.
 */
const DEFAULT_TRANSFORM = "f_auto,q_auto";

/**
 * Injects a delivery transform into a Cloudinary image URL.
 *
 * Anything that isn't a Cloudinary delivery URL is returned untouched, so
 * this is safe to run over hand-entered values — the admin lets you paste
 * any URL, and a Wix or S3 link shouldn't be mangled.
 */
export function optimizedImage(
  url: string | null | undefined,
  transform: string = DEFAULT_TRANSFORM
): string {
  if (!url) return "";

  const index = url.indexOf(UPLOAD_SEGMENT);
  if (index === -1) return url;

  const start = index + UPLOAD_SEGMENT.length;
  const rest = url.slice(start);

  // Already asking for one of these? Leave it alone rather than stacking a
  // second, conflicting transform on top.
  const firstSegment = rest.split("/")[0] ?? "";
  if (/(^|,)(f_|q_)/.test(firstSegment)) return url;

  // Cloudinary chains transforms with "/", so prepending is valid even when
  // the URL already carries an unrelated one like `w_500`.
  return `${url.slice(0, start)}${transform}/${rest}`;
}


/* ────────────────────────────────────────────────────────────────────────
 * Background removal
 *
 * Product photos arrive shot on black. The site paints them on neutral-900,
 * so an opaque black square mostly hides — until it sits on the spectrum
 * glow behind a strain card, where the seam shows.
 *
 * `e_background_removal` is Cloudinary's AI subject detection, and it's the
 * only option that survived testing on a real jar: `e_make_transparent`
 * keys on a flat colour, so at tolerance 10 it ate the black lid and at 30
 * it hollowed out the whole jar. Background removal left lid, label and nug
 * intact.
 *
 * Stored IN the URL rather than as a column, so there's no schema change and
 * no second source of truth — the image either carries the transform or it
 * doesn't. optimizedImage() chains f_auto,q_auto in front of it, which cuts
 * the result from 2.1 MB to 238 KB.
 *
 * It's a paid add-on and runs asynchronously: the first request for a given
 * asset can return the original while Cloudinary processes it, then serve
 * the cut-out on a later request.
 * ──────────────────────────────────────────────────────────────────────── */

const BACKGROUND_REMOVAL = "e_background_removal";

export function isCloudinaryUrl(url: string): boolean {
  return url.includes(UPLOAD_SEGMENT) && url.includes("res.cloudinary.com");
}

export function hasBackgroundRemoved(url: string): boolean {
  return url.includes(`/${BACKGROUND_REMOVAL}/`);
}

export function withBackgroundRemoved(url: string): string {
  if (!isCloudinaryUrl(url) || hasBackgroundRemoved(url)) return url;

  const start = url.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length;
  return `${url.slice(0, start)}${BACKGROUND_REMOVAL}/${url.slice(start)}`;
}

export function withoutBackgroundRemoved(url: string): string {
  return url.replace(`/${BACKGROUND_REMOVAL}/`, "/");
}
