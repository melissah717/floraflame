"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { directionsUrl, stockistKey, type Stockist } from "@/lib/stockists";

type Pin = Stockist & { miles?: number };

/**
 * Mapbox map with a pin per stockist.
 *
 * mapbox-gl is imported dynamically inside useEffect, not at module scope.
 * Client components still render on the server for the initial HTML, and
 * mapbox-gl touches `window` while loading — a top-level import crashes the
 * server render. The CSS import is safe at module scope.
 *
 * Three separate effects, deliberately:
 *   1. create the map (once)
 *   2. rebuild pins + fit bounds (when the list changes)
 *   3. fly to a selection (when `selected` changes)
 * Merging 2 and 3 would refit the bounds every time someone clicks a shop,
 * yanking the view back out instead of zooming in.
 */
export function StockistMap({
  stockists,
  focus,
  origin,
  selected,
  className,
}: {
  /** Every shop — all of these get a pin. */
  stockists: Pin[];
  /**
   * Subset to frame. Defaults to everything, so the first view shows the
   * full California footprint rather than just whichever handful the list
   * happens to be showing.
   */
  focus?: Pin[];
  origin?: { lat: number; lng: number } | null;
  /** Key of the shop to zoom to — see stockistKey(). */
  selected?: string | null;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());
  const originMarker = useRef<Marker | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // --- 1. create the map once ------------------------------------------
  useEffect(() => {
    if (!token || !container.current || map.current) return;
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !container.current) return;

      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: container.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-121.5, 37.5],
        zoom: 5,
        cooperativeGestures: true, // don't hijack page scroll
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // --- 2. rebuild pins when the list changes ---------------------------
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !map.current) return;

      markers.current.forEach((m) => m.remove());
      markers.current.clear();

      const valid = stockists.filter(
        (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
      );
      if (!valid.length) return;

      valid.forEach((s) => {
        /**
         * TWO elements, not one.
         *
         * Mapbox positions a marker by writing `transform` onto its
         * element. Any CSS that also sets transform on that element —
         * a Tailwind scale class, say — fights it, and the dot renders
         * offset from the coordinate Mapbox is anchoring the popup to.
         *
         * So the outer div belongs to Mapbox and we never style it. All
         * appearance and animation goes on the inner dot.
         */
        const el = document.createElement("div");
        el.style.cursor = "pointer";
        el.style.width = "14px";
        el.style.height = "14px";

        const dot = document.createElement("div");
        dot.className =
          "h-full w-full rounded-full border-2 border-neutral-900 bg-neutral-50 shadow-md transition-transform duration-300 hover:scale-125";
        el.appendChild(dot);

        const popup = new mapboxgl.Popup({
          offset: 18,
          closeButton: false,
          anchor: "bottom", // sit directly above the pin, never over it
          /**
           * THE SCROLL BUG.
           *
           * Mapbox focuses a popup when it opens (this defaults to true),
           * and focusing an element makes the browser scroll it into view.
           * The map sits above the list, so clicking a shop name scrolled
           * the page up to reveal the whole map.
           *
           * Off is right here: the popup opens in response to a click the
           * user just made on a control they can see, so focus is already
           * where it should be.
           */
          focusAfterOpen: false,
        }).setHTML(
          `<div style="font-family:inherit;padding:2px 4px;min-width:170px">
             <strong style="display:block;font-size:14px;margin-bottom:2px">
               ${escapeHtml(s.name)}
             </strong>
             <span style="font-size:12px;color:#7a7263;display:block;margin-bottom:6px">
               ${escapeHtml([s.address, s.city].filter(Boolean).join(", "))}
             </span>
             <a href="${directionsUrl(s)}" target="_blank" rel="noopener noreferrer"
                style="font-size:12px;color:#1c1915;text-decoration:underline">
               Directions →
             </a>
           </div>`
        );

        markers.current.set(
          stockistKey(s),
          new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([s.lng, s.lat])
            .setPopup(popup)
            .addTo(map.current!)
        );
      });

      originMarker.current?.remove();
      originMarker.current = null;

      if (origin) {
        const el = document.createElement("div");
        el.style.width = "16px";
        el.style.height = "16px";
        const dot = document.createElement("div");
        dot.className =
          "h-full w-full rounded-full border-2 border-white bg-blue-600 shadow-md";
        el.appendChild(dot);
        originMarker.current = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([origin.lng, origin.lat])
          .addTo(map.current);
      }

    })();

    return () => {
      cancelled = true;
    };
  }, [stockists, origin, token]);

  // --- 2b. frame the focus set -----------------------------------------
  // Separate from marker building so a search can reframe without tearing
  // down and rebuilding all 45 pins.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !map.current) return;

      const set = (focus && focus.length ? focus : stockists).filter(
        (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
      );
      if (!set.length) return;

      /**
       * With an origin we frame the origin plus the nearest few, so a search
       * lands on that neighbourhood. Without one we frame every shop, which
       * is the whole-state footprint on first load.
       *
       * Capping at the 4 nearest matters: including all 45 would stretch
       * the bounds statewide again and the search would appear to do
       * nothing, which is exactly the failure this replaced.
       */
      const points = origin
        ? [...set.slice(0, 4), origin as Pin]
        : set;

      // One point has no bounds to fit — without this special case Mapbox
      // zooms to maximum and shows an empty residential street.
      if (points.length === 1) {
        map.current.easeTo({
          center: [points[0].lng, points[0].lat],
          zoom: 12,
          duration: 800,
        });
        return;
      }

      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.current.fitBounds(bounds, {
        padding: origin ? 80 : 56,
        // Looser cap when framing everything, tighter when zoomed to a
        // search — otherwise a dense cluster like SF stays too far out.
        maxZoom: origin ? 13 : 9,
        duration: 900,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [focus, stockists, origin, token]);

  // --- 3. fly to the selected shop -------------------------------------
  useEffect(() => {
    if (!map.current || !selected) return;

    const shop = stockists.find((s) => stockistKey(s) === selected);
    const marker = markers.current.get(selected);
    if (!shop || !marker) return;

    map.current.flyTo({
      center: [shop.lng, shop.lat],
      zoom: 14,
      duration: 1200,
      essential: true, // still runs for prefers-reduced-motion users
    });

    // The canvas is focusable, and a focused element gets scrolled into
    // view. Nothing here needs keyboard focus, so hand it back.
    const canvas = map.current.getCanvas();
    if (document.activeElement === canvas) canvas.blur();

    // Close any other popup first, or you get several open at once.
    markers.current.forEach((m, key) => {
      if (key !== selected && m.getPopup()?.isOpen()) m.togglePopup();
    });
    if (!marker.getPopup()?.isOpen()) marker.togglePopup();

    // Highlight the inner dot. Styling the outer element would overwrite
    // Mapbox's positioning transform and shift the pin off its coordinate.
    markers.current.forEach((m, key) => {
      const el = m.getElement();
      const dot = el.firstElementChild as HTMLElement | null;
      const active = key === selected;

      if (dot) {
        dot.classList.toggle("scale-[1.6]", active);
        dot.classList.toggle("ring-4", active);
        dot.classList.toggle("ring-[#a83c1b]/20", active);
        // Same accent as the selected name in the list, so the two read
        // as one highlighted thing rather than two separate states.
        dot.style.backgroundColor = active ? "#a83c1b" : "";
      }
      // Raise the active pin so its ring isn't clipped by neighbours.
      el.style.zIndex = active ? "10" : "";
    });
  }, [selected, stockists]);

  if (!token) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-neutral-700 bg-neutral-800 ${className ?? ""}`}
      >
        <span className="text-xs tracking-[0.04em] text-neutral-400">
          Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN not set
        </span>
      </div>
    );
  }

  return <div ref={container} className={className} />;
}

/** Popups take raw HTML, and this content comes from a spreadsheet. */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}