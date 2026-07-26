"use client";

import { useMemo, useState } from "react";
import { Reveal, SectionLabel } from "@/components/scroll-primitives";
import { StockistMap } from "@/components/stockist-map";
import {
  directionsUrl,
  resolveQuery,
  sortByDistance,
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

const VISIBLE = 6;

export function FindUsClient({ stockists }: { stockists: Stockist[] }) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [geoState, setGeoState] = useState<"idle" | "loading" | "denied">("idle");
  const [expanded, setExpanded] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  const results = useMemo(() => {
    if (!origin) return stockists.map((s) => ({ ...s, miles: undefined }));
    return sortByDistance(stockists, origin);
  }, [origin, stockists]);

  const shown = expanded ? results : results.slice(0, VISIBLE);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = resolveQuery(query, stockists);
    setNoMatch(!found);
    if (found) {
      setOrigin(found);
      setOriginLabel(query.trim());
      setExpanded(false);
    }
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
      },
      () => setGeoState("denied"),
      { timeout: 8000 }
    );
  };

  return (
    <section
      id="find-us"
      className="scroll-mt-20 bg-neutral-100 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel number="04">Find Us</SectionLabel>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-[16ch] font-display text-4xl leading-[1.05] sm:text-5xl">
            Carried in {stockists.length} shops across California.
          </h2>
        </Reveal>

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
                className="w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-neutral-900 px-6 py-3 text-sm text-neutral-50 transition-colors hover:bg-neutral-700"
              >
                Search
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
            No match for &ldquo;{query}&rdquo;. Try a nearby city or a zip code.
          </p>
        )}

        {originLabel && !noMatch && (
          <p className="mt-4 text-sm text-neutral-500">
            Nearest to <span className="text-neutral-900">{originLabel}</span>
          </p>
        )}

        {/* Pins come from `shown`, so the map and list always agree. */}
        <Reveal delay={0.1}>
          <StockistMap
            stockists={shown}
            origin={origin}
            className="mt-10 aspect-[16/9] w-full overflow-hidden bg-neutral-200 sm:aspect-[16/7]"
          />
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-px sm:grid-cols-2">
          {shown.map((s) => (
            <StockistCard key={`${s.name}-${s.zip}-${s.lat}`} stockist={s} />
          ))}
        </div>

        {results.length > VISIBLE && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-10 text-sm tracking-[0.02em] underline-offset-4 hover:underline"
          >
            {expanded ? "Show fewer" : `Show all ${results.length} shops`}
          </button>
        )}
      </div>
    </section>
  );
}

function StockistCard({
  stockist,
}: {
  stockist: Stockist & { miles?: number };
}) {
  // Guards the empty-address case (delivery entries) so the line doesn't
  // start with a stray comma.
  const location = [stockist.address, stockist.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex items-start justify-between gap-6 border-t border-neutral-200 py-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-xl">{stockist.name}</h3>
          {typeof stockist.miles === "number" && (
            <span className="shrink-0 text-xs tabular-nums text-neutral-500">
              {stockist.miles < 10
                ? stockist.miles.toFixed(1)
                : Math.round(stockist.miles)}{" "}
              mi
            </span>
          )}
        </div>

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
        className="group mt-1 inline-flex shrink-0 items-center gap-2 text-sm tracking-[0.02em]"
      >
        Directions
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
  );
}