"use client";

import React, { useMemo } from "react";
import { max } from "d3";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaRedditAlien,
  FaTelegramPlane,
  FaYoutube,
  FaRss,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type Top10Item = {
  platforms?: string;
  platformsCount?: number;
  trendScoreValue?: number;
  weightedScoreValue?: number;
  nsriScoreValue?: number;
  truthScoreValue?: number;
};

type PlotRow = {
  platform: string;
  influence_score: number;
  total_narratives: number;
  total_contribution: number;
  avg_nsri: number;
  avg_velocity: number;
};

function buildPlatformInfluence(items: Top10Item[]): PlotRow[] {
  const platformMap = new Map<string, PlotRow>();

  for (const item of items) {
    const platforms = String(item.platforms || "")
      .split(",")
      .map((platform) => platform.trim())
      .filter(Boolean);
    const platformCount = Math.max(1, Number(item.platformsCount ?? platforms.length ?? 0));
    const trendScore = Number(item.weightedScoreValue ?? item.trendScoreValue ?? item.nsriScoreValue ?? item.truthScoreValue ?? 0);
    const contribution = Math.min(100, platformCount * 12 + trendScore * 0.08);

    for (const platform of platforms.length ? platforms : ["Unknown"]) {
      const current = platformMap.get(platform) || {
        platform,
        influence_score: 0,
        total_narratives: 0,
        total_contribution: 0,
        avg_nsri: 0,
        avg_velocity: 0,
      };
      current.influence_score += contribution;
      current.total_narratives += 1;
      current.total_contribution += Math.min(100, platformCount * 10);
      current.avg_nsri += Number(item.nsriScoreValue ?? 0);
      current.avg_velocity += trendScore;
      platformMap.set(platform, current);
    }
  }

  return [...platformMap.values()]
    .map((row) => ({
      ...row,
      influence_score: Number(row.influence_score.toFixed(2)),
      total_contribution: Number((row.total_contribution / Math.max(1, row.total_narratives)).toFixed(2)),
      avg_nsri: Number((row.avg_nsri / Math.max(1, row.total_narratives)).toFixed(2)),
      avg_velocity: Number((row.avg_velocity / Math.max(1, row.total_narratives)).toFixed(2)),
    }))
    .sort((a, b) => b.influence_score - a.influence_score);
}

function platformIcon(platform: string) {
  const normalized = platform.trim().toLowerCase();
  const iconClassName = "h-3.5 w-3.5";

  if (normalized.includes("youtube") || normalized.includes("yt")) return <FaYoutube className={iconClassName} />;
  if (normalized.includes("instagram") || normalized.includes("insta")) return <FaInstagram className={iconClassName} />;
  if (normalized === "x" || normalized.includes("twitter")) return <FaXTwitter className={iconClassName} />;
  if (normalized.includes("facebook")) return <FaFacebookF className={iconClassName} />;
  if (normalized.includes("reddit")) return <FaRedditAlien className={iconClassName} />;
  if (normalized.includes("telegram")) return <FaTelegramPlane className={iconClassName} />;
  if (normalized.includes("linkedin")) return <FaLinkedinIn className={iconClassName} />;
  if (normalized.includes("rss") || normalized.includes("news")) return <FaRss className={iconClassName} />;
  return platform.slice(0, 2).toUpperCase();
}

const ICON_WIDTH = 44;
const LABEL_GAP = 8;
const BAR_HEIGHT_FACTOR = 0.54;

export default function Top10BarChart({
  items,
  platformRows: explicitPlatformRows,
}: {
  items?: Top10Item[] | null;
  platformRows?: PlotRow[] | null;
}) {
  const platformRows = useMemo(
    () => explicitPlatformRows ?? buildPlatformInfluence(Array.isArray(items) ? items : []),
    [explicitPlatformRows, items],
  );
  const visibleRows = useMemo(
    () =>
      [...platformRows].sort((left, right) => {
        const valueDifference = right.influence_score - left.influence_score;
        if (valueDifference !== 0) return valueDifference;
        return left.platform.localeCompare(right.platform);
      }),
    [platformRows],
  );

  const maxValue = useMemo(() => max(visibleRows.map((d) => d.influence_score)) ?? 0, [visibleRows]);

  const chartHeight = Math.max(visibleRows.length * 52 + 12, 440);
  const rowStep = visibleRows.length ? (chartHeight - 24) / visibleRows.length : 56;
  const chartWidth = 100;
  const barMaxWidth = 100;
  const valueAreaLeft = 0;

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-115 sm:min-h-130 w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,35,0.92),rgba(3,8,25,0.88))] shadow-[0_24px_80px_-40px_rgba(15,23,42,0.85)] backdrop-blur">
        <div className="border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(99,102,241,0.22),rgba(249,115,22,0.2))] text-slate-100 shadow-[0_10px_25px_-15px_rgba(59,130,246,0.8)]">
              ↔
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-wide text-white">Cross-Platform Influence Contribution</h3>
              <p className="text-[11px] text-slate-400">Hover the bars for detailed platform influence data.</p>
            </div>
          </div>
        </div>

        <div className="relative flex-1 px-3 pb-2 pt-2 sm:px-4">
          <div className="relative h-full overflow-hidden rounded-2xl bg-transparent" style={{ height: `${chartHeight}px` }}>
            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              {Array.from({ length: 8 }).map((_, index) => {
                const x = ((index + 1) / 8) * 100;
                return (
                  <g key={x} transform={`translate(${x},0)`} className="text-slate-700/70">
                    <line y1={0} y2={chartHeight} stroke="currentColor" strokeDasharray="6,6" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                  </g>
                );
              })}
            </svg>

            {visibleRows.map((entry, index) => {
              const rowTop = index * rowStep + 12;
              const barHeight = Math.max(rowStep * BAR_HEIGHT_FACTOR, 14);
              const barWidth = maxValue
                ? entry.influence_score > 0
                  ? Math.max((entry.influence_score / maxValue) * (barMaxWidth - 24), 3)
                  : 3
                : 3;
              const rowCenter = rowTop + barHeight / 2;
              const colorClass =
                index % 5 === 0
                  ? "bg-pink-300 dark:bg-pink-400"
                  : index % 5 === 1
                    ? "bg-purple-300 dark:bg-purple-400"
                    : index % 5 === 2
                      ? "bg-indigo-300 dark:bg-indigo-400"
                      : index % 5 === 3
                        ? "bg-sky-300 dark:bg-sky-400"
                        : "bg-orange-300 dark:bg-orange-400";

              return (
                <React.Fragment key={entry.platform}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute flex items-center justify-center rounded-full border border-white/10 bg-slate-800/90 text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)]`}
                        style={{
                          left: `${valueAreaLeft}px`,
                          top: `${rowCenter}px`,
                          width: `${ICON_WIDTH}px`,
                          height: `${ICON_WIDTH}px`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        {platformIcon(entry.platform)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="border border-zinc-200 bg-white px-3.5 py-2 text-slate-900 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                      <div className="text-sm font-medium">{entry.platform}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-300">Influence: {entry.influence_score.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-300">Narratives: {entry.total_narratives}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-300">
                        Contribution: {entry.total_contribution.toFixed(2)}%
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <div
                    className={`absolute rounded-r-[10px] ${colorClass}`}
                    style={{
                      left: `${ICON_WIDTH + LABEL_GAP}px`,
                      top: `${rowTop}px`,
                      width: `${barWidth}%`,
                      height: `${barHeight}px`,
                    }}
                  />

                  <span
                    className="absolute -translate-y-1/2 whitespace-nowrap text-xs font-medium text-slate-300"
                    style={{
                      left: `${ICON_WIDTH + LABEL_GAP + barWidth + 6}px`,
                      top: `${rowCenter}px`,
                    }}
                  >
                    {entry.influence_score.toFixed(2)}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
