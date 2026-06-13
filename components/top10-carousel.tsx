"use client";

import React, { useMemo, useState } from "react";
import { FaChartLine, FaShieldAlt, FaBalanceScale, FaBolt } from "react-icons/fa";

type PrecomputedItem = {
  key: string;
  rankLabel: string;
  claim: string;
  claimFull: string;
  sector: string;
  truth: string;
  platforms: string;
  nsriScore: string;
  weightedScore: string;
  truthScore: string | number;
  trendScore: string | number;
  nsriSource?: string;
  nsriFormulaVersion?: string;
  nsriParameters?: {
    synthetic_probability_score?: number;
    propagation_velocity_gradient?: number;
    trust_signal_score?: number;
    viral_pattern_score?: number;
    sentiment_risk_score?: number;
    coordination_density_coefficient?: number;
  };
  nsriLegend: string;
  nsriRiskBand: string;
  nsriIndicates: string;
  liveSource: string;
  historySummary: string;
  recordsCount: string | number;
  whyRanked?: string;
};

export default function Top10Carousel({ items }: { items: PrecomputedItem[] }) {
  const [index, setIndex] = useState(0);
  const total = items.length;
  const cur = items[index];
  const shortClaim = cur?.claim ? `${cur.claim.slice(0, 70)}${cur.claim.length > 70 ? "..." : ""}` : "";
  const mobileWholeNumber = (value: string | number) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? Math.round(numericValue) : value;
  };

  const toneClass = useMemo(
    () =>
      index < 3
        ? "from-emerald-500/45 via-lime-400/30 to-transparent text-emerald-100"
        : cur?.nsriRiskBand === "Severe"
          ? "from-rose-400/25 via-pink-400/15 to-transparent text-rose-200"
          : cur?.nsriRiskBand === "High"
            ? "from-orange-400/25 via-amber-400/15 to-transparent text-orange-200"
            : cur?.nsriRiskBand === "Moderate"
              ? "from-yellow-400/20 via-amber-300/10 to-transparent text-amber-200"
              : "from-emerald-400/20 via-cyan-300/10 to-transparent text-emerald-200",
    [cur?.nsriRiskBand, index],
  );

  const badgeTone = useMemo(
    () =>
      cur?.nsriRiskBand === "Severe"
        ? "border-rose-300/30 bg-rose-400/10 text-rose-100"
        : cur?.nsriRiskBand === "High"
          ? "border-orange-300/30 bg-orange-400/10 text-orange-100"
          : cur?.nsriRiskBand === "Moderate"
            ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
            : "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
    [cur?.nsriRiskBand],
  );

  if (!total) {
    return (
      <div className="flex h-full min-h-130 items-center justify-center rounded-[28px] border border-white/10 bg-[rgba(10,20,42,0.5)] px-4 py-6 text-sm text-slate-300">
        Top 10 list is not available yet. Start the webapp pipeline to generate world rankings.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-115 sm:min-h-130">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,13,31,0.96),rgba(9,19,44,0.86))] shadow-[0_18px_50px_rgba(3,8,23,0.35)] min-h-115 sm:min-h-130">
        <div className={`relative overflow-hidden border-b border-white/10 px-5 py-4`}>
          <div className={`absolute inset-0 bg-linear-to-br ${toneClass}`} />
          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-300/80">
                Rank {index + 1} of {total}
              </p>
              <h3 className="mt-1 wrap-break-word text-lg font-semibold leading-snug text-white sm:text-xl lg:text-2xl">
                {shortClaim}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous"
                onClick={() => setIndex((i) => (i - 1 + total) % total)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white/20 hover:text-white"
              >
                ◀
              </button>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${badgeTone}`}>
                {cur.rankLabel}
              </span>
              <button
                aria-label="Next"
                onClick={() => setIndex((i) => (i + 1) % total)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white/20 hover:text-white"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-2 text-xs text-slate-200">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{cur.sector}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{cur.truth}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{cur.platforms}</span>
          </div>

          <div className="grid min-h-0 gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <FaShieldAlt className="h-4 w-4 text-emerald-300" />
                  <span>NSRI</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-white">
                  <span className="sm:hidden">{mobileWholeNumber(cur.nsriScore)}</span>
                  <span className="hidden sm:inline">{cur.nsriScore}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <FaChartLine className="h-4 w-4 shrink-0 translate-y-px text-cyan-300" />
                  <span>Weighted</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-white">
                  <span className="sm:hidden">{mobileWholeNumber(cur.weightedScore)}</span>
                  <span className="hidden sm:inline">{cur.weightedScore}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <FaBalanceScale className="h-4 w-4 text-amber-300" />
                  <span>Truth</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-white">
                  <span className="sm:hidden">{mobileWholeNumber(cur.truthScore)}</span>
                  <span className="hidden sm:inline">{cur.truthScore}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <FaBolt className="h-4 w-4 text-yellow-300" />
                  <span>Trend</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-white">
                  <span className="sm:hidden">{mobileWholeNumber(cur.trendScore)}</span>
                  <span className="hidden sm:inline">{cur.trendScore}</span>
                </p>
              </div>
            </div>

            <div className="min-h-50 max-h-70 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Summary</p>
              <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-300 sm:text-[15px]">
                {cur.claimFull}
              </p>
              {cur.whyRanked ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d1b3a]/70 px-4 py-3 text-sm text-slate-200">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Why ranked</p>
                  <p className="mt-2 whitespace-pre-wrap wrap-break-word leading-7 text-slate-300">{cur.whyRanked}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1b3a]/70 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">NSRI Score</p>
                <span className="text-xs font-semibold text-slate-200">{cur.nsriRiskBand}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                synthetic {cur.nsriParameters?.synthetic_probability_score ?? "-"} x 0.20 + propagation{" "}
                {cur.nsriParameters?.propagation_velocity_gradient ?? "-"} x 0.22 + weak-source risk{" "}
                {cur.nsriParameters?.trust_signal_score ?? "-"} x 0.18 + sentiment{" "}
                {cur.nsriParameters?.sentiment_risk_score ?? "-"} x 0.15 + coordination{" "}
                {cur.nsriParameters?.coordination_density_coefficient ?? "-"} x 0.10
              </p>
              <p className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">{cur.nsriRiskBand}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{cur.nsriIndicates}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{cur.nsriLegend}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
