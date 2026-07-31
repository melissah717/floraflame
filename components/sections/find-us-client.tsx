"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";
import { StockistMap } from "@/components/stockist-map";
import {
  directionsUrl,
  geocodeQuery,
  resolveQuery,
  sortByDistance,
  stockistKey,
  type Stockist,
} from "@/lib/stockists";

/**
 * A flat list of 44 shops is unreadable — nobody scans it. People want one
 * answer: which is nearest me. So results are always sorted by distance
 * from either the user's location or a searched city, and only the top few
 * show until asked.
 *
 * Cards carry name / address / distance / one action. Hours and store
 * websites are deliberately absent: hours across 44 businesses go stale and
 * make this site a source of bad information, and linking to a shop's own
 * menu sends people to competitors' flower.
 */

const VISIBLE = 4;

export function FindUsClient({ stockists }: { stockists: Stockist[] }) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [geoState, setGeoState] = useState<"idle" | "loading" | "denied">("idle");
  const [expanded, setExpanded] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [searching, setSearching] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  /**
   * Range runs from the section entering the viewport to its top reaching
   * roughly a third up the screen — so the count finishes as the heading
   * settles into a comfortable reading position, not while it's still
   * sliding in from the bottom.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 35%"],
  });

  const headingY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const [selected, setSelected] = useState<string | null>(null);

  /**
   * No scrollIntoView here. It was firing on desktop as well as mobile and
   * throwing the page back to the top — and moving someone's scroll
   * position when they clicked a name they could already see is the wrong
   * behaviour regardless.
   */
  const selectShop = (key: string) => {
    setSelected((current) => (current === key ? null : key));
  };

  /**
   * Nothing lists until the user has told us where they are.
   *
   * An unsorted list of 45 shops answers no question anyone is asking —
   * the map already shows the footprint. The list only becomes useful once
   * "nearest" means something, so it stays empty until there's an origin.
   */
  const hasOrigin = origin !== null;

  const results = useMemo(() => {
    if (!origin) return [];
    return sortByDistance(stockists, origin);
  }, [origin, stockists]);

  /**
   * Memoised deliberately. `.slice()` returns a NEW array every call, so an
   * inline version changes identity on every render — including renders
   * caused by selecting a shop. That re-runs the map's rebuild effect,
   * which calls fitBounds and cancels the flyTo a moment after it starts.
   */
  const shown = useMemo(
    () => (expanded ? results : results.slice(0, VISIBLE)),
    [expanded, results]
  );

  /**
   * What the map frames after a search — distance-bounded, not count-bounded.
   *
   * Taking the nearest 4 regardless of distance breaks wherever coverage is
   * thin. Search Los Angeles and only two shops are anywhere near; entries
   * 3 and 4 are 350 miles north, so the bounds stretch statewide and the
   * search looks like it did nothing.
   *
   * So: shops within 45 miles. If nothing qualifies, frame the single
   * nearest — the honest answer to "nothing near you" is one distant pin,
   * not a map of the whole state.
   */
  const focusSet = useMemo(() => {
    if (!origin || !results.length) return undefined;
    const near = results.filter((r) => r.miles <= 45);
    return near.length ? near.slice(0, 4) : results.slice(0, 1);
  }, [origin, results]);

  /**
   * Two-stage lookup.
   *
   *   1. Local table — instant, no network, covers "SF", "Oakland", zips
   *      belonging to shops we already stock.
   *   2. Mapbox Geocoding — anything else. A zip like 94539 is a real place
   *      that simply isn't one of our stockists; "no match" was the wrong
   *      answer to it. The right answer is the four nearest shops.
   */
  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    const local = resolveQuery(q, stockists);
    if (local) {
      applyOrigin(local, q);
      return;
    }

    setSearching(true);
    const geo = await geocodeQuery(q);
    setSearching(false);

    if (geo) {
      applyOrigin({ lat: geo.lat, lng: geo.lng }, geo.label);
    } else {
      setNoMatch(true);
    }
  };

  const applyOrigin = (
    point: { lat: number; lng: number },
    label: string
  ) => {
    setOrigin(point);
    setOriginLabel(label);
    setNoMatch(false);
    setExpanded(false);
    setSelected(null);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setGeoState("denied");
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setOriginLabel("your location");
        setGeoState("idle");
        setQuery("");
        setNoMatch(false);
        setExpanded(false);
        setSelected(null);
      },
      () => setGeoState("denied"),
      { timeout: 8000 }
    );
  };

  return (
    <section
      ref={sectionRef}
      id="find-us"
      className="scroll-mt-20 bg-neutral-100 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel number="04">Find Us</SectionLabel>
        </Reveal>

        <motion.h2
          style={reduce ? undefined : { y: headingY, opacity: headingOpacity }}
          className="mt-6 max-w-[14ch] font-display text-4xl leading-[1.02] sm:text-6xl"
        >
          Carried in{" "}
          <CountUp
            to={stockists.length}
            progress={scrollYProgress}
            disabled={!!reduce}
          />{" "}
          shops across California.
        </motion.h2>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={runSearch} className="flex flex-1 gap-2">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setNoMatch(false);
                }}
                placeholder="City or zip — try SF, Oakland, 95351"
                aria-label="Search by city or zip"
                className="w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900"
              />
              <button
                type="submit"
                disabled={searching}
                className="shrink-0 rounded-full bg-neutral-900 px-6 py-3 text-sm text-neutral-50 transition-colors hover:bg-neutral-700 disabled:opacity-60"
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </form>

            <button
              onClick={useMyLocation}
              className="shrink-0 text-sm text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline sm:ml-4"
            >
              {geoState === "loading" ? "Locating…" : "Use my location"}
            </button>
          </div>
        </Reveal>

        {geoState === "denied" && (
          <p className="mt-3 text-sm text-neutral-500">
            Couldn&apos;t get your location — search by city or zip instead.
          </p>
        )}

        {noMatch && (
          <p className="mt-3 text-sm text-neutral-500">
            Couldn&apos;t find &ldquo;{query}&rdquo; in California. Try a city
            name or a zip code.
          </p>
        )}

        {originLabel && !noMatch && (
          <p className="mt-4 text-sm text-neutral-500">
            Nearest to <span className="text-neutral-900">{originLabel}</span>
          </p>
        )}

        {/* Pins come from `shown`, so the map and list always agree. */}
        <Reveal delay={0.1}>
          <div className="mt-10">
            <StockistMap
              // All 45 pins always render — the map shows the full
              // footprint while the list shows the nearest few.
              stockists={stockists}
              // Frame everything until there's a search to narrow to.
              focus={focusSet}
              origin={origin}
              selected={selected}
              className="aspect-[16/9] w-full overflow-hidden bg-neutral-200 sm:aspect-[16/7]"
            />
          </div>
        </Reveal>

        {!hasOrigin ? (
          <p className="mt-8 text-sm text-neutral-500">
            Every pin is a shop carrying Flora &amp; Flame. Search a city or
            use your location to find the closest ones.
          </p>
        ) : (
          <>
            <div className="mt-10 grid gap-x-8 gap-y-px sm:grid-cols-2">
              {shown.map((s) => {
                const key = stockistKey(s);
                return (
                  <StockistCard
                    key={key}
                    stockist={s}
                    isSelected={selected === key}
                    onSelect={() => selectShop(key)}
                  />
                );
              })}
            </div>

            {results.length > VISIBLE && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-8 text-sm tracking-[0.02em] underline-offset-4 hover:underline"
              >
                {expanded
                  ? "Show fewer"
                  : `Show all ${results.length} shops`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Scroll-linked counter.
 *
 * The number is written straight to the DOM node in a MotionValue
 * subscriber rather than held in React state. Driving it through state
 * would re-render this component on every animation frame — sixty renders
 * a second to change one string. This bypasses React entirely for the
 * update, which is the standard pattern for per-frame values.
 *
 * tabular-nums stops the digits jittering: proportional figures change
 * width as they cycle, so the words after the number would twitch.
 */
function CountUp({
  to,
  progress,
  disabled,
}: {
  to: number;
  progress: MotionValue<number>;
  disabled: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const raw = useTransform(progress, [0, 0.85], [0, to]);
  // A spring gives it weight — it races up, overshoots by a hair, settles.
  const smooth = useSpring(raw, { stiffness: 90, damping: 22, mass: 0.6 });

  useMotionValueEvent(smooth, "change", (v) => {
    if (ref.current) {
      ref.current.textContent = String(Math.min(to, Math.round(v)));
    }
  });

  if (disabled) {
    return <span className="tabular-nums">{to}</span>;
  }

  return (
    <span
      ref={ref}
      className="tabular-nums text-[#a83c1b]"
      // Server-rendered value: the real number, so the markup is correct
      // for crawlers and for anyone who sees it before hydration.
      suppressHydrationWarning
    >
      {to}
    </span>
  );
}

/** Warm red accent. Move to a CSS variable if it spreads beyond here. */
const ACCENT = "#a83c1b";

function StockistCard({
  stockist,
  isSelected,
  onSelect,
}: {
  stockist: Stockist & { miles?: number };
  isSelected: boolean;
  onSelect: () => void;
}) {
  // Guards the empty-address case so the line can't start with a comma.
  const location = [stockist.address, stockist.city].filter(Boolean).join(", ");

  return (
    <div className="flex items-start justify-between gap-6 border-t border-neutral-200 py-6">
      <div className="min-w-0">
        <button
          // Explicit type. A <button> with no type defaults to "submit",
          // which triggers form behaviour and unexpected scrolling if it
          // ever ends up inside a form.
          type="button"
          onClick={onSelect}
          className="group flex items-baseline text-left"
        >
          <motion.h3
            animate={{
              // Archivo is a variable font, so weight is a continuous
              // axis — 800 → 900 reads as emphasis, not a swap to a
              // different typeface.
              fontWeight: isSelected ? 900 : 800,
              color: isSelected ? ACCENT : "#1c1915",
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="font-display text-xl transition-opacity group-hover:opacity-60"
          >
            {stockist.name}
          </motion.h3>

          {typeof stockist.miles === "number" && (
            <span className="ml-3 shrink-0 text-xs tabular-nums text-neutral-500">
              {stockist.miles < 10
                ? stockist.miles.toFixed(1)
                : Math.round(stockist.miles)}{" "}
              mi
            </span>
          )}
        </button>

        <p className="mt-1 text-sm text-neutral-500">
          {location}
          {stockist.state ? `, ${stockist.state}` : ""} {stockist.zip}
        </p>

        {stockist.status === "restocking" && (
          <p className="mt-2 text-xs text-neutral-500">Restocking soon</p>
        )}
      </div>

      <a
        href={directionsUrl(stockist)}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-1 inline-flex shrink-0 items-center gap-2 text-sm tracking-[0.02em] text-neutral-500 transition-colors hover:text-neutral-900"
      >
        Directions
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
  );
}