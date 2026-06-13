"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type PublicItem = {
  id: string | null;
  analysis_id: string;
  filename: string;
  created_at: string;
  overall_status: string;
};

export default function PublicScansPage() {
  const [items, setItems] = useState<PublicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPublicScans() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch("/api/public-analysis-results?limit=100", { cache: "no-store" });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to load public scans.");
        }

        const data = (await response.json()) as PublicItem[];
        if (isMounted) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load public scans.");
          setItems([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPublicScans();

    const handlePublicUpdate = () => {
      if (isMounted) {
        loadPublicScans();
      }
    };

    window.addEventListener("public-scans:update", handlePublicUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("public-scans:update", handlePublicUpdate);
    };
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/4 p-5 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Public scans</h1>
        <p className="mt-2 text-sm text-slate-300">
          Public analysis results shared by all users. Click any file to open its stored results.
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
                href={`/analyzer/results/${encodeURIComponent(item.analysis_id)}?source=public`}
                className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3 transition hover:bg-white/6"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{item.filename}</div>
                    <div className="truncate text-xs text-slate-400">{item.created_at}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
                    <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                      {item.overall_status || "—"}
                    </span>
                    <span className="inline-flex w-fit rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-100">
                      public
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No public scans yet.
          </div>
        )}
      </section>
    </div>
  );
}
