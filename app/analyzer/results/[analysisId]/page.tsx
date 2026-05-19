"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AnalyzerResultDashboard } from "@/components/analyzer-result-dashboard";
import { apiFetch } from "@/lib/api";

type ApiPayload = {
  db: {
    id: string;
    analysis_id: string;
    filename: string;
    created_at: string;
    overall_status: string;
    [key: string]: unknown;
  };
  record: any;
};

export default function AnalyzerResultPage() {
  const params = useParams<{ analysisId: string }>();
  const analysisId = params?.analysisId;

  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadResult() {
      if (!analysisId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/api/analysis-results/${encodeURIComponent(analysisId)}`, { cache: "no-store" });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to load result.");
        }

        const data = (await response.json()) as ApiPayload;
        if (isMounted) setPayload(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load result.");
          setPayload(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadResult();

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  const record = payload?.record;
  const summary = useMemo(() => record?.summary ?? {}, [record]);
  const timing = useMemo(() => record?.timing ?? record?.result?.timing ?? null, [record]);

  return (
    <div className="px-3 py-5 sm:px-5 lg:px-7 lg:py-8">
      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : record ? (
        <AnalyzerResultDashboard
          result={{ ...payload?.db, ...record, analysis_id: payload?.db?.analysis_id ?? record?.analysis_id }}
          summary={summary}
          timing={timing}
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          Result not available.
        </div>
      )}
    </div>
  );
}
