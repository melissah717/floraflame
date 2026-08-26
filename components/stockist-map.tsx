"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { directionsUrl, stockistKey, type Stockist } from "@/lib/stockists";

type Pin = Stockist & { miles?: number };

/**
 * Mapbox map with a pin per stockist.
 *
 * Effects, deliberately separate:
 *   1. create the map (once), then flip `ready` on its 'load' event
 *   2. rebuild pins + attach click handlers (when the list changes)
 *   2b. frame the focus set (when a search reframes)
 *   3. fly to + bloom the selection (when `selected` changes)
 */
export function StockistMap({
  stockists,
  focus,
  origin,
  selected,
  onSelectPin,
  className,
}: {
  stockists: Pin[];
  focus?: Pin[];
  origin?: { lat: number; lng: number } | null;
  selected?: string | null;
  onSelectPin?: (key: string) => void;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());
  const originMarker = useRef<Marker | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [mapFailed, setMapFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // Latest onSelectPin, held in a ref so effect 2 doesn't need it in its deps
  // — otherwise every parent render rebuilds all 45 markers and cancels any
  // in-flight flyTo.
  const onSelectRef = useRef(onSelectPin);
  useEffect(() => {
    onSelectRef.current = onSelectPin;
  }, [onSelectPin]);

  // --- 1. create the map once ------------------------------------------
  useEffect(() => {
    if (!token || !container.current || map.current) return;
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !container.current || map.current) return;

      if (!hasWebGL()) {
        console.warn("[stockist-map] WebGL unavailable — showing fallback");
        if (!cancelled) setMapFailed(true);
        return;
      }

      mapboxgl.accessToken = token;

      try {
        map.current = new mapboxgl.Map({
          container: container.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [-121.5, 37.5],
          zoom: 5,
          cooperativeGestures: true, // don't hijack page scroll
        });
      } catch (err) {
        console.error("[stockist-map] Failed to initialize WebGL:", err);
        if (!cancelled) setMapFailed(true);
        return;
      }

      map.current.on("load", () => {
        if (!cancelled) setReady(true);
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );
    })();

    return () => {
      cancelled = true;
      markers.current.forEach((m) => m.remove());
      markers.current.clear();
      originMarker.current?.remove();
      originMarker.current = null;
      map.current?.remove();
      map.current = null;
      setReady(false);
    };
  }, [token]);

  // --- 2. rebuild pins when the list changes ---------------------------
  useEffect(() => {
    if (!token || !ready) return;
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
        // Outer element belongs to Mapbox (it writes `transform` for
        // positioning) — never style it. Appearance goes on the inner dot.
        const el = document.createElement("div");
        el.style.cursor = "pointer";
        el.style.width = "14px";
        el.style.height = "14px";
        // Lift the selection up to the parent so effect 3 can fly + bloom.
        el.addEventListener("click", () => onSelectRef.current?.(stockistKey(s)));

        const dot = document.createElement("div");
        dot.className =
          "pin-dot h-full w-full rounded-full border-2 border-neutral-900 bg-neutral-50 shadow-md transition-transform duration-300 hover:scale-125";
        el.appendChild(dot);

        const popup = new mapboxgl.Popup({
          offset: 18,
          closeButton: false,
          anchor: "bottom",
          focusAfterOpen: false, // stops the click from scroll-jumping the page
        }).setHTML(
          `<div style="font-family:'Cabinet Grotesk',system-ui,sans-serif;position:relative;min-width:222px;padding:16px 18px;background:#0f0e0c;color:#faf8f4;border-radius:14px;box-shadow:0 22px 55px rgba(0,0,0,0.5);outline:1px solid rgba(250,248,244,0.14)">
            <div style="position:absolute;inset:4px;border:1px solid rgba(250,248,244,0.08);border-radius:10px;pointer-events:none"></div>
            <strong style="display:block;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:17px;line-height:1.1;letter-spacing:-0.01em;color:#faf8f4">
              ${escapeHtml(s.name)}
            </strong>
            ${
              s.city
                ? `<div style="margin:8px 0 8px;font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;color:#8a847a">
                      ${escapeHtml(s.city)}
                    </div>`
                : `<div style="height:8px"></div>`
            }
            <span style="font-size:12.5px;line-height:1.5;color:#cfc7b8;display:block">
              ${escapeHtml(s.address ?? "")}
            </span>
            <a href="${directionsUrl(s)}" target="_blank" rel="noopener noreferrer"
                style="display:inline-block;margin-top:12px;font-size:12px;letter-spacing:0.03em;color:#e0a94a;text-decoration:underline;text-underline-offset:3px">
              Directions →
            </a>
          </div>`
        )

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
  }, [stockists, origin, token, ready]);

  // --- 2b. frame the focus set -----------------------------------------
  useEffect(() => {
    if (!token || !ready) return;
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !map.current) return;

      const set = (focus && focus.length ? focus : stockists).filter(
        (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
      );
      if (!set.length) return;

      const points = origin ? [...set.slice(0, 4), origin as Pin] : set;

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
        maxZoom: origin ? 13 : 9,
        duration: 900,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [focus, stockists, origin, token, ready]);

  // --- 3. fly to + bloom the selected shop -----------------------------
  useEffect(() => {
    if (!ready || !map.current) return;

    // Nothing selected — clear the bloom/popups and stop.
    if (!selected) {
      markers.current.forEach((m) => {
        const dot = m.getElement().firstElementChild as HTMLElement | null;
        if (dot) {
          dot.classList.remove("is-selected");
          dot.style.backgroundColor = "";
          dot.style.borderColor = "";
        }
        m.getElement().style.zIndex = "";
        if (m.getPopup()?.isOpen()) m.togglePopup();
      });
      return;
    }

    const shop = stockists.find((s) => stockistKey(s) === selected);
    const marker = markers.current.get(selected);
    if (!shop || !marker) return;
    const mapH = map.current.getContainer().clientHeight;
    const yOffset = Math.min(120, mapH * 0.28);

    map.current.flyTo({
      center: [shop.lng, shop.lat],
      zoom: 14,
      offset: [0, yOffset],
      duration: 1200,
      essential: true,
    });

    const canvas = map.current.getCanvas();
    if (document.activeElement === canvas) canvas.blur();

    markers.current.forEach((m, key) => {
      if (key !== selected && m.getPopup()?.isOpen()) m.togglePopup();
    });
    if (!marker.getPopup()?.isOpen()) marker.togglePopup();

    // Bloom the active pin (orange ripple lives in .pin-dot.is-selected::before/::after).
    markers.current.forEach((m, key) => {
      const el = m.getElement();
      const dot = el.firstElementChild as HTMLElement | null;
      const active = key === selected;
      if (dot) {
        dot.classList.toggle("is-selected", active);
        dot.style.backgroundColor = active ? "#e07a2e" : "";
        dot.style.borderColor = active ? "#e07a2e" : "";
      }
      el.style.zIndex = active ? "10" : "";
    });
  }, [selected, stockists, ready]);

  if (!token || mapFailed) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-neutral-700 bg-neutral-800 ${className ?? ""}`}
      >
        <span className="text-xs tracking-[0.04em] text-neutral-400">
          {mapFailed
            ? "Map unavailable: this browser couldn't initialize WebGL"
            : "Map unavailable: NEXT_PUBLIC_MAPBOX_TOKEN not set"}
        </span>
      </div>
    );
  }

  // Wrapper carries the sizing/overflow className; the map fills it, and the
  // purple vignette sits on top as the "fog" (real setFog is a globe/3D
  // feature and barely shows on a flat top-down map).
  return (
    <div className={`relative ${className ?? ""}`}>
      <div ref={container} className="h-full w-full" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 105% at 50% 40%, transparent 50%, rgba(72,46,96,0.5) 100%)",
        }}
      />
    </div>
  );
}

/** WebGL preflight so a missing context drops to the fallback quietly. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext(
        "experimental-webgl"
      )) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Popups take raw HTML, and this content comes from a spreadsheet. */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}