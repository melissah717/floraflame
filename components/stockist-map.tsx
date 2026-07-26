"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { directionsUrl, type Stockist } from "@/lib/stockists";

type Pin = Stockist & { miles?: number };

/**
 * Mapbox map with a pin per stockist.
 *
 * mapbox-gl is imported dynamically inside useEffect rather than at module
 * scope. Client components still render on the server for the initial HTML,
 * and mapbox-gl touches `window` as it loads — a top-level import crashes
 * the server render. The CSS import is safe at module scope.
 *
 * Markers are torn down and rebuilt whenever `stockists` changes, which is
 * fine at this scale (tens of pins). With hundreds you'd diff instead.
 */
export function StockistMap({
  stockists,
  origin,
  className,
}: {
  stockists: Pin[];
  /** Searched city or the user's location — drawn as a distinct dot. */
  origin?: { lat: number; lng: number } | null;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const originMarker = useRef<Marker | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // --- create the map once ---------------------------------------------
  useEffect(() => {
    if (!token || !container.current || map.current) return;

    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !container.current) return;

      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: container.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-121.5, 37.5], // roughly central California
        zoom: 5,
        attributionControl: true,
        cooperativeGestures: true, // stops the map hijacking page scroll
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

  // --- redraw pins whenever the list changes ---------------------------
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !map.current) return;

      markers.current.forEach((m) => m.remove());
      markers.current = [];

      const valid = stockists.filter(
        (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
      );
      if (!valid.length) return;

      valid.forEach((s) => {
        const el = document.createElement("div");
        el.className =
          "h-3 w-3 rounded-full border-2 border-white bg-neutral-900 shadow-md cursor-pointer transition-transform hover:scale-125";

        const popup = new mapboxgl.Popup({
          offset: 14,
          closeButton: false,
        }).setHTML(
          `<div style="font-family:inherit;padding:2px 4px;min-width:160px">
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

        markers.current.push(
          new mapboxgl.Marker({ element: el })
            .setLngLat([s.lng, s.lat])
            .setPopup(popup)
            .addTo(map.current!)
        );
      });

      // Origin dot, visually distinct from the shops.
      originMarker.current?.remove();
      originMarker.current = null;

      if (origin) {
        const el = document.createElement("div");
        el.className =
          "h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md";
        originMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([origin.lng, origin.lat])
          .addTo(map.current);
      }

      // Frame everything that matters. A single pin has no bounds to fit,
      // so centre on it instead or the map zooms to maximum.
      const points = origin ? [...valid, origin as Pin] : valid;

      if (points.length === 1) {
        map.current.easeTo({
          center: [points[0].lng, points[0].lat],
          zoom: 12,
          duration: 800,
        });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        points.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.current.fitBounds(bounds, {
          padding: 64,
          maxZoom: 13,
          duration: 800,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stockists, origin, token]);

  if (!token) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-neutral-300 bg-neutral-50 ${className ?? ""}`}
      >
        <span className="text-xs tracking-[0.04em] text-neutral-400">
          Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN not set
        </span>
      </div>
    );
  }

  return <div ref={container} className={className} />;
}

/** Popups take raw HTML, so anything from the sheet must be escaped. */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}