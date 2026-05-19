"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type RecentItem = {
  id: string | null;
  analysis_id: string;
  filename: string;
  created_at: string;
  overall_status: string;
};

export default function RecentsPage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRecents() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch("/api/analysis-results?limit=50", { cache: "no-store" });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to load recents.");
        }

        const data = (await response.json()) as RecentItem[];
        if (isMounted) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load recents.");
          setItems([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecents();

    const handleRecentsUpdate = () => {
      if (isMounted) {
        loadRecents();
      }
    };

    window.addEventListener("recents:update", handleRecentsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("recents:update", handleRecentsUpdate);
    };
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/4 p-5 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Recents</h1>
        <p className="mt-2 text-sm text-slate-300">
          Recent analyses for your account. Click any file to open its stored results.
        </p>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Loading...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : items.length ? (
          <div className="mt-6 grid gap-3">
            {items.map((item) => (
              <Link
                key={item.analysis_id}
                href={`/analyzer/results/${encodeURIComponent(item.analysis_id)}`}
                className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3 transition hover:bg-white/6"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{item.filename}</div>
                    <div className="truncate text-xs text-slate-400">{item.created_at}</div>
                  </div>
                  <div className="mt-2 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 sm:mt-0">
                    {item.overall_status || "—"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No recent analyses yet.
          </div>
        )}
      </section>
    </div>
  );
}
