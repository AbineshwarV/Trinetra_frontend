"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

type SocialTrendItem = {
  trending_story?: string;
  summary?: string;
  category?: string;
  social_media_apps?: string[];
  geographic_spread?: string[];
  keywords?: string[];
  trend_score?: number;
  truth_status?: string;
  aggregated_views?: string;
  posts?: string;
  viral_velocity?: string;
  nsri?: {
    score?: number;
    risk_band?: string;
    indicates?: string;
  };
};

type SocialTrendsPayload = {
  top_25?: SocialTrendItem[];
  platform_specific?: Record<string, SocialTrendItem[]>;
};

function formatScore(value?: number) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(3);
}

function normalizePlatformName(value: string) {
  const raw = String(value || "").toLowerCase().trim();
  if (!raw) return "";
  if (raw.includes("facebook")) return "Facebook";
  if (raw.includes("instagram") || raw.includes("crowd_angle")) return "Instagram";
  if (raw.includes("youtube")) return "YouTube";
  if (raw === "x" || raw.includes("twitter") || raw.includes("x_trends")) return "X";
  if (raw.includes("reddit")) return "Reddit";
  if (raw.includes("telegram")) return "Telegram";
  if (raw.includes("threads")) return "Threads";
  if (raw.includes("news") || raw.includes("rss")) return "News";
  return value;
}

export default function SocialTrendsSection({ payload, items }: { payload?: SocialTrendsPayload | null; items?: SocialTrendItem[] | null }) {
  const [view, setView] = useState<"trending" | "platform">("trending");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const platformButtonRef = useRef<HTMLButtonElement | null>(null);
  const sourceItems = Array.isArray(items) ? items : Array.isArray(payload?.top_25) ? payload.top_25 : [];
  const platformLabels = ["Facebook", "Instagram", "YouTube", "X", "Reddit", "Telegram"];

  const orderedItems = useMemo(
    () => [...sourceItems].sort((left, right) => Number(right.trend_score || right.nsri?.score || 0) - Number(left.trend_score || left.nsri?.score || 0)),
    [sourceItems],
  );

  const platformOptions = useMemo(() => {
    return ["all", ...platformLabels];
  }, []);

  const platformSpecificItems = useMemo(() => {
    if (selectedPlatform === "all") return orderedItems;
    const explicit = Object.entries(payload?.platform_specific || {})
      .filter(([key]) => normalizePlatformName(key) === selectedPlatform)
      .flatMap(([, trends]) => trends || []);
    if (explicit.length) return [...explicit].sort((left, right) => Number(right.trend_score || right.nsri?.score || 0) - Number(left.trend_score || left.nsri?.score || 0));
    return orderedItems.filter((trend) => (trend.social_media_apps || []).some((platform) => normalizePlatformName(platform) === selectedPlatform));
  }, [orderedItems, payload?.platform_specific, selectedPlatform]);

  const visibleItems = view === "trending" ? orderedItems.slice(0, 10) : platformSpecificItems.slice(0, 10);
  const selectedPlatformLabel = selectedPlatform === "all" ? "All platforms" : selectedPlatform;
  const summaryText = `${orderedItems.length} records analyzed with ${view === "trending" ? "local social trend feed" : "platform-specific social trend feed"}`;

  useEffect(() => {
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.top = "0";
    element.style.left = "0";
    element.style.width = "0";
    element.style.height = "0";
    element.style.zIndex = "9999";
    document.body.appendChild(element);
    setPortalElement(element);
    return () => {
      document.body.removeChild(element);
    };
  }, []);

  useEffect(() => {
    if (!platformMenuOpen || !platformButtonRef.current) {
      setMenuStyle(null);
      return;
    }

    const updateMenuPosition = () => {
      const rect = platformButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuStyle({
        position: "absolute",
        top: `${rect.bottom + window.scrollY + 8}px`,
        left: `${Math.max(rect.right - 180, rect.left)}px`,
        width: "180px",
        minWidth: "180px",
        zIndex: 9999,
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition);
    };
  }, [platformMenuOpen]);

  const tableRows = visibleItems.map((trend, index) => {
      const apps = Array.isArray(trend.social_media_apps) ? trend.social_media_apps.join(", ") : "-";
      const regions = Array.isArray(trend.geographic_spread) ? trend.geographic_spread.join(", ") : "-";
      const keywords = Array.isArray(trend.keywords) ? trend.keywords.slice(0, 8).join(", ") : "-";
      const nsriScore = trend.nsri?.score ?? 0;
      return (
        <tr
          key={`${trend.trending_story || "trend"}-${index}`}
          className={`align-top text-[12px] leading-5 transition-colors ${
            index % 2 === 0 ? "bg-[rgba(7,15,34,0.98)] text-slate-100" : "bg-[rgba(10,20,42,0.74)] text-slate-200"
          }`}
        >
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-400" : "text-slate-300"}`}>
            #{index + 1}
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-100" : "text-slate-100"} font-medium`}>
            <div className="max-w-37.5 whitespace-normal wrap-break-word leading-5">
              {trend.trending_story || "Untitled trend"}
            </div>
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            {trend.category || "-"}
          </td>
          <td className={`align-top border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            <div className="min-w-55 max-w-65 whitespace-normal break-normal text-[11px] leading-5">
              {trend.summary || "No summary available."}
            </div>
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            <div className="max-w-30 whitespace-normal wrap-break-word leading-5">{apps}</div>
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            <div className="max-w-30 whitespace-normal wrap-break-word leading-5">{trend.aggregated_views || "-"}</div>
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            <div className="max-w-30 whitespace-normal wrap-break-word leading-5">{trend.posts || "-"}</div>
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 text-[12px] font-medium ${index % 2 === 0 ? "text-slate-100" : "text-slate-100"}`}>
            {formatScore(trend.trend_score)}
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            {trend.truth_status || "-"}
          </td>
          <td className="border-b border-white/10 px-3 py-3.5">
            <div className="flex max-w-32 flex-col gap-1.5">
              <div className={`text-[11px] font-semibold leading-4 ${index % 2 === 0 ? "text-slate-100" : "text-slate-100"}`}>
                {formatScore(nsriScore)} {trend.nsri?.risk_band || ""}
              </div>
              <div
                className={`inline-flex max-w-32 rounded-md px-2.5 py-1.5 text-[10px] leading-4 shadow-sm ${
                  index % 2 === 0
                    ? "border border-cyan-300/30 bg-[rgba(34,211,238,0.12)] text-cyan-100"
                    : "border border-sky-200 bg-[rgba(147,197,253,0.18)] text-sky-100"
                }`}
              >
                <span className="line-clamp-2">{trend.nsri?.indicates || "-"}</span>
              </div>
            </div>
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            <div className="max-w-30 whitespace-normal wrap-break-word leading-5">{regions}</div>
          </td>
          <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
            <div className="max-w-35 whitespace-normal wrap-break-word leading-5">{keywords}</div>
          </td>
        </tr>
      );
    });

  return (
    <section className="relative z-40 overflow-hidden rounded-3xl border border-(--app-shell-card-border) bg-(--app-shell-card) p-4 shadow-[0_16px_40px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            {view === "trending" ? "Top Trending in Social Media" : "Platform Specific Social Trends"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {view === "trending"
              ? summaryText
              : `${visibleItems.length} records shown for ${selectedPlatform === "all" ? "all platforms" : selectedPlatform}`}
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setView("trending")}
            className={`rounded-full border px-3 py-1 text-[11px] transition ${
              view === "trending"
                ? "border-[rgba(34,211,238,0.45)] bg-[rgba(34,211,238,0.18)] text-cyan-100"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Trending
          </button>
          <button
            type="button"
            onClick={() => setView("platform")}
            className={`rounded-full border px-3 py-1 text-[11px] transition ${
              view === "platform"
                ? "border-[rgba(59,130,246,0.45)] bg-[rgba(59,130,246,0.18)] text-sky-100"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Platform Filter
          </button>
          {view === "platform" ? (
            <div className="relative z-50 shrink-0 overflow-visible">
              <button
                ref={platformButtonRef}
                type="button"
                onClick={() => setPlatformMenuOpen((value) => !value)}
                className="inline-flex h-9 max-w-40 min-w-32 items-center justify-center gap-2 rounded-full border border-white/10 bg-[rgba(7,15,34,0.9)] px-3 text-[11px] text-slate-100 outline-none transition hover:bg-[rgba(10,20,42,0.98)]"
              >
                <span className="truncate text-center">{selectedPlatform === "all" ? "All" : selectedPlatform}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform duration-200 ${platformMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {platformMenuOpen && portalElement && menuStyle ? (
                createPortal(
                  <div style={menuStyle}>
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[rgba(7,15,34,0.98)] shadow-[0_18px_40px_rgba(2,8,23,0.55)] backdrop-blur-md">
                      {platformOptions.map((platform) => {
                        const active = selectedPlatform === platform;
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => {
                              setSelectedPlatform(platform);
                              setPlatformMenuOpen(false);
                            }}
                            className={`flex w-full items-center px-3.5 py-2.5 text-left text-sm transition ${
                              active
                                ? "bg-[rgba(37,99,235,0.88)] text-white"
                                : "text-slate-200 hover:bg-[rgba(255,255,255,0.05)]"
                            }`}
                          >
                            {platform === "all" ? "All platforms" : platform}
                          </button>
                        );
                      })}
                    </div>
                  </div>,
                  portalElement,
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 min-w-0 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[rgba(7,15,34,0.86)] text-slate-100">
        <div className="relative z-0 max-h-130 overflow-x-auto overflow-y-auto thin-scrollbar [scrollbar-width:thin] [scrollbar-color:rgba(71,85,105,0.9)_rgba(15,23,42,0.22)]">
          <table className="min-w-260 w-full border-separate border-spacing-0 text-left lg:min-w-full">
            <thead className="sticky top-0 z-10 bg-[rgba(7,15,34,0.96)]">
              <tr className="text-left text-[12px] font-semibold text-slate-200">
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">#</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Trending Story</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Category</th>
                <th className="align-top border-b border-white/10 px-3 py-3 whitespace-nowrap">Summary</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Apps</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Aggregated Views</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Posts</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Score</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Truth</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">NSRI</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Regions</th>
                <th className="border-b border-white/10 px-3 py-3 whitespace-nowrap">Keywords</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length ? (
                tableRows
              ) : (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-400" colSpan={12}>
                    No platform-specific social trends yet. Run Layer 2 once.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
