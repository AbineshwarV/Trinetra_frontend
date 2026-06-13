"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type MapItem = {
  claim?: string;
  narrative?: string;
  ranking_score?: number;
  trend_score?: number;
  _map_source?: string;
  _quality_record?: boolean;
  _social_trend?: boolean;
  metadata?: {
    platforms?: string[] | string | null;
    regions?: string[] | string | null;
  } | null;
  platform?: string | null;
  region?: string | null;
};

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n % 1 === 0 ? String(Math.trunc(n)) : n.toFixed(2);
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function WorldMap({ items }: { items?: MapItem[] | null }) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const platformsOf = (item: MapItem) => {
    const md: any = item?.metadata || {};
    if (Array.isArray(md?.platforms)) return md.platforms.map(String);
    if (md?.platforms) return [String(md.platforms)];
    return item.platform ? [String(item.platform)] : [];
  };

  const regionsOf = (item: MapItem) => {
    const md: any = item?.metadata || {};
    if (Array.isArray(md?.regions)) return md.regions.map(String);
    if (md?.regions) return [String(md.regions)];
    return item.region ? [String(item.region)] : [];
  };

  const regionCoords = useMemo<Record<string, [number, number]>>(
    () => ({
      Global: [20.0, 0.0],
      World: [20.0, 0.0],
      US: [39.8283, -98.5795],
      USA: [39.8283, -98.5795],
      "United States": [39.8283, -98.5795],
      UK: [55.3781, -3.436],
      "United Kingdom": [55.3781, -3.436],
      Europe: [54.526, 15.2551],
      Japan: [36.2048, 138.2529],
      China: [35.8617, 104.1954],
      "South Korea": [35.9078, 127.7669],
      Australia: [-25.2744, 133.7751],
      "Middle East": [29.2985, 42.551],
      Gaza: [31.5017, 34.4668],
      Israel: [31.0461, 34.8516],
      Russia: [61.524, 105.3188],
      Ukraine: [48.3794, 31.1656],
      "Tamil Nadu": [11.1271, 78.6569],
      Kerala: [10.8505, 76.2711],
      Karnataka: [15.3173, 75.7139],
      Telangana: [18.1124, 79.0193],
      "Andhra Pradesh": [15.9129, 79.74],
      "Delhi/North": [28.7041, 77.1025],
      Northeast: [26.2006, 92.9376],
      India: [22.9734, 78.6569],
      Unknown: [20.5937, 78.9629],
    }),
    [],
  );

  const regionStats = useMemo(() => {
    const stats = new globalThis.Map<
      string,
      { region: string; count: number; top: MapItem | null; items: MapItem[] }
    >();

    for (const item of list) {
      const regions = regionsOf(item).map((r) => String(r).trim()).filter(Boolean);
      const bucket = regions.length ? regions : ["Unknown"];
      for (const region of bucket) {
        if (!stats.has(region)) stats.set(region, { region, count: 0, top: null, items: [] });
        const row = stats.get(region)!;
        row.count += 1;
        row.items.push(item);
        if (!row.top || num(item.ranking_score) > num(row.top.ranking_score)) row.top = item;
      }
    }

    return [...stats.values()].sort((a, b) => b.count - a.count);
  }, [list]);

  useEffect(() => {
    if (!leafletReady) return;
    if (!mapDivRef.current) return;
    const L = (globalThis as any).L;
    if (!L) return;
    if (mapRef.current) return;

    const map = L.map(mapDivRef.current, { scrollWheelZoom: true }).setView([20.0, 0.0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markerLayerRef.current = markerLayer;

    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // ignore
      }
    }, 150);

    return () => {
      try {
        markerLayer?.clearLayers?.();
      } catch {
        // ignore
      }
      try {
        map?.remove?.();
      } catch {
        // ignore
      }
      markerLayerRef.current = null;
      mapRef.current = null;
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!leafletReady) return;
    const L = (globalThis as any).L;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!L || !map || !markerLayer) return;

    const mapPopupHtml = (row: { region: string; count: number; items: MapItem[] }) => {
      const unique = (() => {
        const seen = new Set<string>();
        const out: MapItem[] = [];
        for (const item of row.items) {
          const key = `${String(item.claim || item.narrative || "").trim().toLowerCase()}|${String(item._map_source || "")}`;
          if (!key || seen.has(key)) continue;
          seen.add(key);
          out.push(item);
        }
        return out;
      })();

      const byRank = (a: MapItem, b: MapItem) => num(b.ranking_score ?? b.trend_score) - num(a.ranking_score ?? a.trend_score);

      const rows = unique
        .sort(byRank)
        .slice(0, 12)
        .map((item, index) => {
          const title = (item.claim || item.narrative || "Untitled item").trim();
          const source = String(item._map_source || (item._social_trend ? "Social Trend" : item._quality_record ? "Quality Record" : "Layer 2"));
          const platforms = platformsOf(item).slice(0, 3).join(", ") || "source n/a";
          const rank = fmt(item.ranking_score ?? item.trend_score ?? 0);
          return `<li class="tw-map-popup__item">
            <div class="tw-map-popup__row">
              <span class="tw-map-popup__idx">${index + 1}.</span>
              <div class="tw-map-popup__title">${escapeHtml(title)}</div>
            </div>
            <div class="tw-map-popup__meta">
              <span class="tag tag--source">${escapeHtml(source)}</span>
              <span class="tag tag--platforms">${escapeHtml(platforms)}</span>
              <span class="tag tag--rank">rank ${escapeHtml(rank)}</span>
            </div>
          </li>`;
        })
        .join("");

      return `<div class="tw-map-popup">
        <div class="tw-map-popup__header">
          <h3 class="tw-map-popup__title">${escapeHtml(row.region)}</h3>
          <div class="tw-map-popup__subtitle">${row.count} mapped news/trend items from quality records and social media.</div>
        </div>
        <ol class="tw-map-popup__list">${rows || "<li>No mapped stories</li>"}</ol>
      </div>`;
    };

    markerLayer.clearLayers();
    const layers: any[] = [];

    for (const row of regionStats) {
      const coords = regionCoords[row.region] || regionCoords.Unknown;
      const marker = L.circleMarker(coords, {
        radius: Math.max(7, Math.min(24, 6 + row.count * 2)),
        color: "#ffffff",
        weight: 2,
        fillColor: row.count >= 5 ? "#dc2626" : row.count >= 3 ? "#d97706" : "#0f766e",
        fillOpacity: 0.82,
      }).addTo(markerLayer);
      marker.bindPopup(mapPopupHtml(row), { maxWidth: 420 });
      marker.on("click", () => {
        try {
          const current = map.getZoom();
          map.setView(coords, Math.min(current + 1, 4), { animate: true });
        } catch {
          // ignore
        }
      });
      layers.push(marker);
    }

    if (layers.length) {
      map.fitBounds(L.featureGroup(layers).getBounds().pad(0.24), { maxZoom: 4 });
    }
  }, [leafletReady, regionStats, regionCoords]);

  return (
    <div className="flex h-full min-h-90 flex-col">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={() => setLeafletReady(true)}
      />

      <style jsx global>{`

        .leaflet-container {
          height: 100%;
          width: 100%;
        }
        /* Darken basemap tiles only (avoid inverting popup UI) */
        .leaflet-tile {
          filter: invert(1) hue-rotate(180deg) saturate(1.25) brightness(0.92) contrast(1.1);
        }
        .leaflet-control-attribution {
          font-size: 10px;
        }
          /* =========================================
   REMOVE LEAFLET DEFAULT POPUP UI
========================================= */

.leaflet-popup-content-wrapper {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  overflow: visible !important;
  border-radius: 0 !important;
}

.leaflet-popup-content {
  margin: 0 !important;
  padding: 0 !important;
}

.leaflet-popup-tip-container,
.leaflet-popup-tip,
.leaflet-popup-close-button {
  display: none !important;
}

/* =========================================
   MAIN POPUP
========================================= */

.tw-map-popup {
  position: relative;

  width: clamp(270px, 30vw, 440px);

  padding: 12px;

  border-radius: 20px;

  overflow: hidden;

  background:
    linear-gradient(
      145deg,
      rgba(23, 33, 54, 0.96),
      rgba(15, 23, 42, 0.94)
    );

  border: 1px solid rgba(255,255,255,0.06);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  box-shadow:
    0 12px 32px rgba(0,0,0,0.18);

  color: #fff;
}

/* =========================================
   SOFT GLOW
========================================= */

.tw-map-popup::before {
  content: "";

  position: absolute;
  inset: 0;

  background:
    radial-gradient(
      circle at top right,
      rgba(59,130,246,0.10),
      transparent 36%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(168,85,247,0.08),
      transparent 36%
    );

  pointer-events: none;
}

/* =========================================
   HEADER
========================================= */

.tw-map-popup__header {
  position: relative;
  z-index: 1;

  padding-bottom: 8px;
  margin-bottom: 10px;

  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.tw-map-popup__title {
  margin: 0;

  font-size: clamp(13px, 1vw, 18px);
  font-weight: 700;

  line-height: 1.2;

  color: #fff;

  word-break: break-word;
}

.tw-map-popup__subtitle {
  margin-top: 3px;

  font-size: clamp(8px, 0.7vw, 11px);
  line-height: 1.45;

  color: rgba(255,255,255,0.72);
}

/* =========================================
   LIST
========================================= */

.tw-map-popup__list {
  position: relative;
  z-index: 1;

  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;

  gap: 7px;

  max-height: 260px;

  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.12) transparent;
}

.tw-map-popup__list::-webkit-scrollbar {
  width: 4px;
}

.tw-map-popup__list::-webkit-scrollbar-track {
  background: transparent;
}

.tw-map-popup__list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 999px;
}

/* =========================================
   ITEM CARD
========================================= */

.tw-map-popup__item {
  list-style: none;

  padding: 10px;

  border-radius: 15px;

  background:
    linear-gradient(
      135deg,
      rgba(255,255,255,0.06),
      rgba(255,255,255,0.025)
    );

  border: 1px solid rgba(255,255,255,0.05);

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.tw-map-popup__item:hover {
  transform: translateY(-1px);

  border-color: rgba(96,165,250,0.18);

  background:
    linear-gradient(
      135deg,
      rgba(59,130,246,0.08),
      rgba(255,255,255,0.03)
    );
}

/* =========================================
   ROW
========================================= */

.tw-map-popup__row {
  display: flex;
  align-items: flex-start;

  gap: 8px;
}

/* =========================================
   GLASS NUMBER BADGE
========================================= */

.tw-map-popup__idx {
  position: relative;
  overflow: hidden;

  width: 21px;
  height: 21px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 999px;

  font-size: 8px;
  font-weight: 700;

  color: #fff;

  border: 1px solid rgba(255,255,255,0.14);

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* shine */

.tw-map-popup__idx::before {
  content: "";

  position: absolute;

  top: 1px;
  left: 2px;
  right: 2px;

  height: 42%;

  border-radius: 999px;

  background:
    linear-gradient(
      to bottom,
      rgba(255,255,255,0.42),
      transparent
    );
}

/* =========================================
   BADGE COLORS
========================================= */

.tw-map-popup__list li:nth-child(6n + 1) .tw-map-popup__idx {
  background:
    linear-gradient(
      135deg,
      rgba(59,130,246,0.34),
      rgba(96,165,250,0.10)
    );
}

.tw-map-popup__list li:nth-child(6n + 2) .tw-map-popup__idx {
  background:
    linear-gradient(
      135deg,
      rgba(34,197,94,0.32),
      rgba(74,222,128,0.10)
    );
}

.tw-map-popup__list li:nth-child(6n + 3) .tw-map-popup__idx {
  background:
    linear-gradient(
      135deg,
      rgba(168,85,247,0.32),
      rgba(192,132,252,0.10)
    );
}

.tw-map-popup__list li:nth-child(6n + 4) .tw-map-popup__idx {
  background:
    linear-gradient(
      135deg,
      rgba(251,146,60,0.32),
      rgba(253,186,116,0.10)
    );
}

.tw-map-popup__list li:nth-child(6n + 5) .tw-map-popup__idx {
  background:
    linear-gradient(
      135deg,
      rgba(236,72,153,0.32),
      rgba(244,114,182,0.10)
    );
}

.tw-map-popup__list li:nth-child(6n) .tw-map-popup__idx {
  background:
    linear-gradient(
      135deg,
      rgba(20,184,166,0.32),
      rgba(45,212,191,0.10)
    );
}

/* =========================================
   CONTENT TEXT
========================================= */

.tw-map-popup__text {
  font-size: clamp(8px, 0.82vw, 13px);

  line-height: 1.45;
  font-weight: 500;

  color: rgba(255,255,255,0.94);

  word-break: break-word;

  overflow: visible;
}

/* =========================================
   TAGS
========================================= */

.tw-map-popup__meta {
  display: flex;
  flex-wrap: wrap;

  gap: 5px;

  margin-top: 7px;
}

.tw-map-popup__list .tag {
  padding: 3px 7px;

  border-radius: 999px;

  font-size: clamp(6px, 0.6vw, 10px);
  font-weight: 600;

  color: rgba(255,255,255,0.86);

  background: rgba(255,255,255,0.07);

  border: 1px solid rgba(255,255,255,0.05);

  white-space: nowrap;
}

/* =========================================
   LARGE SCREEN
========================================= */

@media (min-width: 1400px) {

  .tw-map-popup {
    width: 470px;
  }

  .tw-map-popup__list {
    max-height: 300px;
  }

  .tw-map-popup__text {
    font-size: 13px;
  }

  .tw-map-popup__title {
    font-size: 18px;
  }

  .tw-map-popup__subtitle {
    font-size: 11px;
  }

  .tw-map-popup__idx {
    width: 22px;
    height: 22px;

    font-size: 9px;
  }

  .tw-map-popup__list .tag {
    font-size: 10px;
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 640px) {

  .tw-map-popup {
    width: min(92vw, 260px);

    padding: 9px;

    border-radius: 16px;
  }

  .tw-map-popup__title {
    font-size: 11px;
  }

  .tw-map-popup__subtitle {
    font-size: 7px;
  }

  .tw-map-popup__list {
    max-height: 160px;
  }

  .tw-map-popup__item {
    padding: 7px;
  }

  .tw-map-popup__text {
    font-size: 7.5px;
    line-height: 1.35;
  }

  .tw-map-popup__idx {
    width: 16px;
    height: 16px;

    font-size: 6px;
  }

  .tw-map-popup__list .tag {
    font-size: 5.5px;

    padding: 2px 5px;
  }
}

      `}</style>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Real World Map</h3>
        </div>
      </div>

      <div className="mt-3 flex-1 min-h-0 overflow-hidden rounded-xl border border-white/10 bg-[rgba(3,10,30,0.35)]">
        <div ref={mapDivRef} className="h-full min-h-65 w-full" />
      </div>
    </div>
  );
}
