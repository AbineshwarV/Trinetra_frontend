"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LiveTrendingRow = {
  key: string;
  rankLabel: string;
  isTop10: boolean;
  claim: string;
  source: string;
  sector: string;
  verdict: string;
  nsriScore: string;
  weightedScore: string;
  trendScore: string;
  platforms: string;
  regions: string;
};

type LiveTrendingTableProps = {
  rows: LiveTrendingRow[];
};

const BATCH_SIZE = 10;
const SCROLL_THRESHOLD = 80;

export default function LiveTrendingTable({ rows }: LiveTrendingTableProps) {
  const initialRowCount = useMemo(() => Math.min(BATCH_SIZE, rows.length), [rows.length]);
  const [loadedCount, setLoadedCount] = useState(initialRowCount);

  useEffect(() => {
    setLoadedCount(initialRowCount);
  }, [initialRowCount]);

  const visibleRows = useMemo(() => rows.slice(0, loadedCount), [rows, loadedCount]);
  const hasMore = visibleRows.length < rows.length;

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      if (hasMore && target.scrollTop + target.clientHeight >= target.scrollHeight - SCROLL_THRESHOLD) {
        setLoadedCount((current) => Math.min(current + BATCH_SIZE, rows.length));
      }
    },
    [hasMore, rows.length],
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[rgba(7,15,34,0.86)] text-slate-100">
      <div
        onScroll={handleScroll}
        className="max-h-105 overflow-auto [scrollbar-width:thin] [scrollbar-color:rgba(94,114,140,0.92)_rgba(10,17,32,0.42)]"
        aria-label="Live trending table"
      >
        <table className="min-w-230 w-full border-separate border-spacing-0 text-left lg:min-w-full">
          <thead className="sticky top-0 z-10 bg-[rgba(7,15,34,0.96)]">
            <tr className="text-left text-[12px] font-semibold text-slate-200">
              <th className="border-b border-white/10 px-3 py-3">#</th>
              <th className="border-b border-white/10 px-3 py-3">Top</th>
              <th className="border-b border-white/10 px-3 py-3">Claim</th>
              <th className="border-b border-white/10 px-3 py-3">Input</th>
              <th className="border-b border-white/10 px-3 py-3">Sector</th>
              <th className="border-b border-white/10 px-3 py-3">Verdict</th>
              <th className="border-b border-white/10 px-3 py-3">NSRI</th>
              <th className="border-b border-white/10 px-3 py-3">Weighted</th>
              <th className="border-b border-white/10 px-3 py-3">Trend</th>
              <th className="border-b border-white/10 px-3 py-3">Sources</th>
              <th className="border-b border-white/10 px-3 py-3">Regions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? (
              visibleRows.map((row, index) => (
                <tr
                  key={row.key}
                  className={`align-top text-[12px] leading-5 transition-colors ${
                    index % 2 === 0 ? "bg-[rgba(7,15,34,0.98)] text-slate-100" : "bg-[rgba(10,20,42,0.74)] text-slate-200"
                  }`}
                >
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-400" : "text-slate-300"}`}>
                    {row.rankLabel}
                  </td>
                  <td className="border-b border-white/10 py-3.5 pl-0 pr-3">
                    {row.isTop10 ? (
                      <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-300/30 bg-[rgba(16,185,129,0.16)] px-2.5 py-1 text-[10px] font-medium text-emerald-100">
                        Top 10
                      </span>
                    ) : null}
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 font-medium ${index % 2 === 0 ? "text-slate-100" : "text-slate-100"}`}>
                    <div className="max-w-37.5 whitespace-normal wrap-break-word leading-5">{row.claim}</div>
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    {row.source}
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    {row.sector}
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    {row.verdict}
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    <b>{row.nsriScore}</b>
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    {row.weightedScore}
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    {row.trendScore}
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    <div className="max-w-30 whitespace-normal wrap-break-word leading-5">{row.platforms}</div>
                  </td>
                  <td className={`border-b border-white/10 px-3 py-3.5 ${index % 2 === 0 ? "text-slate-200" : "text-slate-300"}`}>
                    <div className="max-w-30 whitespace-normal wrap-break-word leading-5">{row.regions}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-400" colSpan={11}>
                  No live trending data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
