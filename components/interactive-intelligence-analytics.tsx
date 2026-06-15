"use client";

import { useEffect, useRef } from "react";
import { ChartColumnIncreasing, ShieldCheck, Sparkles } from "lucide-react";

const TRINETRA_USECASE_2_BASE_URL =
  process.env.NEXT_PUBLIC_TRINETRA_USECASE_2_BASE_URL || "http://127.0.0.1:8080";

function buildTrinetraUrl(endpoint: string) {
  const base = TRINETRA_USECASE_2_BASE_URL.endsWith("/")
    ? TRINETRA_USECASE_2_BASE_URL.slice(0, -1)
    : TRINETRA_USECASE_2_BASE_URL;
  return `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
}

type InteractiveAnalyticsPayload = {
  generated_at?: string;
  latest_item_count?: number;
  snapshot_point_count?: number;
  platform_influence?: Array<{
    platform: string;
    influence_score: number;
    total_narratives: number;
    total_contribution: number;
    avg_nsri: number;
    avg_velocity: number;
  }>;
  competition_timeline?: Array<{
    name: string;
    x: string[];
    y: number[];
    customdata: Array<[string, number, number, string, number, string]>;
  }>;
  truth_landscape_image?: string;
  velocity_distribution_image?: string;
};

type Props = {
  payload: InteractiveAnalyticsPayload | null;
};

function resolveAssetUrl(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("data:")) return src;
  const target = src.startsWith("http://") || src.startsWith("https://") ? src : buildTrinetraUrl(src);
  return `/api/trinetra-asset?url=${encodeURIComponent(target)}`;
}

export default function InteractiveIntelligenceAnalytics({ payload }: Props) {
  const competitionTimelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const target = competitionTimelineRef.current;
    if (!target) return;

    function render() {
      const plotly = (window as Window & { Plotly?: any }).Plotly;
      if (!plotly || !payload || !target) return;

      plotly.purge(target);

      const traces = (payload.competition_timeline || []).map((trace, index) => ({
        type: "scatter",
        mode: "lines+markers",
        name: trace.name,
        x: trace.x,
        y: trace.y,
        customdata: trace.customdata,
        line: { width: 2.6, shape: "spline", smoothing: 1.15 },
        marker: { size: 5 },
        hovertemplate:
          "<b>%{customdata[0]}</b><br>Momentum: %{customdata[1]:.2f}<br>NSRI: %{customdata[2]:.2f}<br>Truth: %{customdata[3]}<br>Velocity: %{customdata[4]:.2f}<br>Timestamp: %{customdata[5]}<extra></extra>",
        visible: index < 6 ? true : "legendonly",
      }));

      plotly.react(
        target,
        traces,
        {
          title: { text: "Narrative Competition Timeline", x: 0.02, xanchor: "left", font: { size: 15, color: "#0f172a" } },
          paper_bgcolor: "#ffffff",
          plot_bgcolor: "#ffffff",
          height: 480,
          autosize: true,
          margin: { l: 62, r: 24, t: 52, b: 92 },
          font: { family: "Segoe UI, system-ui, sans-serif", size: 11, color: "#0f172a" },
          hoverlabel: { bgcolor: "#ffffff", bordercolor: "#d1d5db", font: { color: "#0f172a" } },
          xaxis: {
            title: "Scheduler timestamps",
            type: "date",
            rangeslider: { visible: true, thickness: 0.08 },
            gridcolor: "rgba(148,163,184,0.2)",
            color: "#0f172a",
          },
          yaxis: {
            title: "Composite Narrative Dynamics Signal",
            gridcolor: "rgba(148,163,184,0.2)",
            color: "#0f172a",
          },
          legend: { orientation: "h", y: -0.25, x: 0, font: { size: 10, color: "#0f172a" } },
          dragmode: "pan",
        },
        { responsive: true, displaylogo: false, scrollZoom: true, modeBarButtonsToRemove: ["lasso2d", "select2d"] }
      );
    }

    const existing = document.querySelector('script[data-trinetra-plotly="true"]') as HTMLScriptElement | null;
    const scheduleRender = () => {
      if (!mounted) return;
      const plotly = (window as Window & { Plotly?: any }).Plotly;
      if (plotly) {
        render();
      }
    };

    if (existing) {
      if ((window as Window & { Plotly?: any }).Plotly) {
        scheduleRender();
      } else {
        existing.addEventListener("load", scheduleRender, { once: true });
      }

      return () => {
        mounted = false;
      };
    }

    const script = document.createElement("script");
    script.src = buildTrinetraUrl("/storage/vendor/plotly.min.js");
    script.async = true;
    script.dataset.trinetraPlotly = "true";
    script.onload = () => {
      if (!mounted) return;
      scheduleRender();
    };
    document.body.appendChild(script);

    return () => {
      mounted = false;
      script.onload = null;
      if (existing) existing.removeEventListener("load", scheduleRender);
    };
  }, [payload]);

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(10,20,42,0.62)] p-5 text-slate-100 shadow-[0_16px_40px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:p-6 lg:p-8">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center text-xl font-semibold text-white">
            <Sparkles className="mr-2 h-5 w-5 text-cyan-300" />
            Interactive Intelligence Analytics
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {payload?.latest_item_count ?? 0} latest narratives | {payload?.snapshot_point_count ?? 0} rolling 24h snapshot points | generated {payload?.generated_at ? new Date(payload.generated_at).toLocaleString() : "-"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 min-w-0">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-4 shadow-[0_12px_32px_rgba(2,8,23,0.28)]">
          <h3 className="mb-3 flex items-center text-lg font-semibold text-white">
            <ChartColumnIncreasing className="mr-2 h-4 w-4 text-sky-300" />
            Narrative Competition Timeline
          </h3>
          <div className="w-full overflow-hidden rounded-xl bg-white">
            <div ref={competitionTimelineRef} className="h-120 w-full" />
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-4 shadow-[0_12px_32px_rgba(2,8,23,0.28)]">
          <h3 className="mb-3 flex items-center text-lg font-semibold text-white">
            <ShieldCheck className="mr-2 h-4 w-4 text-emerald-300" />
            Truth Verification Landscape
          </h3>
          {payload?.truth_landscape_image ? (
            <img
              src={resolveAssetUrl(payload.truth_landscape_image)}
              alt="Truth Verification Landscape"
              loading="lazy"
              className="block w-full rounded-xl border border-white/10 bg-[rgba(7,15,34,0.8)]"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 px-4 py-10 text-sm text-slate-300">Not generated yet.</div>
          )}
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-4 shadow-[0_12px_32px_rgba(2,8,23,0.28)]">
          <h3 className="mb-3 flex items-center text-lg font-semibold text-white">
            <ChartColumnIncreasing className="mr-2 h-4 w-4 text-amber-300" />
            Narrative Viral Velocity Distribution
          </h3>
          {payload?.velocity_distribution_image ? (
            <img
              src={resolveAssetUrl(payload.velocity_distribution_image)}
              alt="Narrative Viral Velocity Distribution"
              loading="lazy"
              className="block w-full rounded-xl border border-white/10 bg-[rgba(7,15,34,0.8)]"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 px-4 py-10 text-sm text-slate-300">Not generated yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
