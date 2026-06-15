import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";
import { Fragment } from "react";
import {
  Activity,
  ChartColumnIncreasing,
  Gauge,
  Globe2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import InteractiveIntelligenceAnalytics from "@/components/interactive-intelligence-analytics";

async function fetchJson<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(buildTrinetraUrl(endpoint), { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function readMostRecentJson<T>(dirs: string[], filePrefix: string): Promise<T | null> {
  try {
    const { readdir } = await import("fs/promises");
    const candidates: Array<{ filePath: string; mtimeMs: number }> = [];

    for (const dir of dirs) {
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isFile()) continue;
          if (!entry.name.endsWith(".json")) continue;
          if (filePrefix && !entry.name.startsWith(filePrefix)) continue;
          const filePath = path.join(dir, entry.name);
          const tsMatch = entry.name.match(/(\d{8}_\d{6})/);
          const mtimeMs = tsMatch ? Number(tsMatch[1].replace("_", "")) : 0;
          candidates.push({ filePath, mtimeMs });
        }
      } catch {
        continue;
      }
    }

    candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
    for (const item of candidates) {
      try {
        const raw = await readFile(item.filePath, "utf8");
        return JSON.parse(raw) as T;
      } catch {
        continue;
      }
    }
  } catch {
    return null;
  }

  return null;
}

const TRINETRA_USECASE_2_BASE_URL =
  process.env.TRINETRA_USECASE_2_BASE_URL ||
  process.env.NEXT_PUBLIC_TRINETRA_USECASE_2_BASE_URL ||
  "http://127.0.0.1:8080";
const VIRAL_ENGINE_SNAPSHOT =
  process.env.TRINETRA_VIRAL_ENGINE_SNAPSHOT || "viral_acceleration_20260606_073042.json";

function buildTrinetraUrl(endpoint: string) {
  const base = TRINETRA_USECASE_2_BASE_URL.endsWith("/")
    ? TRINETRA_USECASE_2_BASE_URL.slice(0, -1)
    : TRINETRA_USECASE_2_BASE_URL;
  return `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
}

function resolveTrinetraAssetUrl(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return buildTrinetraUrl(src);
}

type ViralEngineRow = {
  canonical_narrative?: string;
  canonical_summary?: string;
  repeat_count?: number;
  first_seen_at?: string;
  last_seen_at?: string;
  pattern?: string;
  nsri_current?: number;
  truth_status_current?: string;
  spike_percent?: number;
  peak_time?: string;
  prediction_24h?: number;
  prediction_48h?: number;
  confidence?: number;
  stability_score?: number;
  risk?: string;
  graph_url?: string;
  forecast_chart_path?: string;
  forecast_chart_url?: string;
  prediction_24h_direction?: string;
  prediction_48h_direction?: string;
  narrative_stability?: string;
  observed_momentum_series?: number[];
  forecast_momentum_series_48h?: number[];
  risk_observed_series?: number[];
  risk_forecast_series_48h?: number[];
};

type ViralEnginePayload = {
  generated_at?: string;
  narratives?: ViralEngineRow[];
  summary?: {
    model_usage?: {
      forecast?: string;
    };
  };
};

function fmt(value?: number | string | null) {
  if (value == null || value === "") return "-";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(3) : String(value);
}

function trendClass(value?: string | null) {
  const text = String(value || "").toLowerCase();
  if (text.includes("strong")) {
    return "text-emerald-300";
  }
  if (text.includes("weak")) {
    return "text-rose-300";
  }
  if (text.includes("up") || text.includes("increase") || text.includes("rise") || text.includes("bull")) {
    return "text-emerald-300";
  }
  if (text.includes("down") || text.includes("decrease") || text.includes("drop") || text.includes("bear")) {
    return "text-rose-300";
  }
  if (text.includes("flat") || text.includes("stable") || text.includes("neutral")) {
    return "text-amber-300";
  }
  return "text-slate-200";
}

function riskBadgeClass(value?: string | null) {
  const text = String(value || "").toLowerCase();
  if (text.includes("high") || text.includes("severe") || text.includes("critical") || text.includes("urgent")) {
    return "border-rose-400/30 bg-rose-500/15 text-rose-200";
  }
  if (text.includes("moderate") || text.includes("medium")) {
    return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  }
  if (text.includes("low") || text.includes("minimal") || text.includes("safe")) {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }
  return "border-slate-400/20 bg-slate-500/10 text-slate-200";
}

function num(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function fmtTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

function clean(value?: string | null) {
  return String(value || "-").replace(/\s+/g, " ").trim();
}

function sourceNamesPattern() {
  return [
    "mercomindia com", "the economic times", "times of india", "india today", "the hindu",
    "ndtv", "bbc", "reuters", "ani news", "akashvani news", "business standard",
    "bar and bench", "live law", "deccan herald", "moneycontrol", "hindustan times",
    "indian express", "news18", "firstpost", "medium", "google news", "yahoo news",
    "usa today", "the guardian", "euronews",
  ].join("|");
}

function toTitleCase(text: string) {
  return text.replace(/\b([a-z])([a-z']*)/g, (_, first, rest) => `${first.toUpperCase()}${rest}`);
}

function trimRepeatedText(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  for (let size = Math.floor(words.length / 2); size >= 5; size--) {
    const first = words.slice(0, size).join(" ").toLowerCase();
    const second = words.slice(size, size * 2).join(" ").toLowerCase();
    if (first === second) return words.slice(0, size).join(" ");
  }
  return text;
}

function cleanDisplayText(value: string, options: { titleCase?: boolean } = {}) {
  const titleCase = options.titleCase !== false;
  let text = String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:nbsp|amp|quot|font|color|href|target|_blank|blank|rel|nofollow|noopener|noreferrer|seo|description|ol|li)\b/gi, " ")
    .replace(/\b20\d{6}t\d{6}z\b/gi, " ")
    .replace(/[Ã‚ÃƒÃ ]{1,2}[^\s]{0,10}/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();
  text = trimRepeatedText(text);
  text = text.replace(new RegExp(`\\s+(?:${sourceNamesPattern()})(?:\\s+|$).*`, "i"), "");
  text = text.replace(/\s+/g, " ").trim();
  return titleCase ? toTitleCase(text) : text;
}

async function readViralEngineSnapshot(): Promise<ViralEnginePayload> {
  const live = await fetchJson<ViralEnginePayload>("/api/viral-acceleration-engine");
  if (live && Array.isArray(live.narratives)) return live;

  const candidates = [
    path.join(process.cwd(), "..", "crawl engine", "trinetra", "storage", "layer2", "viral_acceleration_engine", "history", VIRAL_ENGINE_SNAPSHOT),
    path.join(process.cwd(), "crawl engine", "trinetra", "storage", "layer2", "viral_acceleration_engine", "history", VIRAL_ENGINE_SNAPSHOT),
    path.join(process.cwd(), "..", "..", "crawl engine", "trinetra", "storage", "layer2", "viral_acceleration_engine", "history", VIRAL_ENGINE_SNAPSHOT),
  ];

  for (const filePath of candidates) {
    try {
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw) as ViralEnginePayload;
    } catch {
      continue;
    }
  }

  const latest = await readMostRecentJson<ViralEnginePayload>(
    [
      path.join(process.cwd(), "..", "crawl engine", "trinetra", "storage", "layer2", "viral_acceleration_engine", "history"),
      path.join(process.cwd(), "..", "..", "crawl engine", "trinetra", "storage", "layer2", "viral_acceleration_engine", "history"),
      path.join(process.cwd(), "crawl engine", "trinetra", "storage", "layer2", "viral_acceleration_engine", "history"),
    ],
    "viral_acceleration_",
  );
  if (latest) return latest;

  return { narratives: [] };
}

async function readTemporalSnapshot(): Promise<any> {
  const live = await fetchJson<any>("/api/temporal-narrative-intelligence");
  if (live) return live;

  const candidates = [
    path.join(process.cwd(), "..", "crawl engine", "trinetra", "storage", "layer2", "temporal_narrative_intelligence", "latest_temporal_narrative_intelligence.json"),
    path.join(process.cwd(), "crawl engine", "trinetra", "storage", "layer2", "temporal_narrative_intelligence", "latest_temporal_narrative_intelligence.json"),
  ];

  for (const filePath of candidates) {
    try {
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw);
    } catch {
      continue;
    }
  }

  const latest = await readMostRecentJson<any>(
    [
      path.join(process.cwd(), "..", "crawl engine", "trinetra", "storage", "layer2", "temporal_narrative_intelligence"),
      path.join(process.cwd(), "..", "..", "crawl engine", "trinetra", "storage", "layer2", "temporal_narrative_intelligence"),
      path.join(process.cwd(), "crawl engine", "trinetra", "storage", "layer2", "temporal_narrative_intelligence"),
    ],
    "temporal_narrative_intelligence_",
  );
  if (latest) return latest;

  return {};
}

function graphSrc(row: ViralEngineRow) {
  const url = row.forecast_chart_path || row.forecast_chart_url || row.graph_url || "";
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return buildTrinetraUrl(url.startsWith("/") ? url : `/${url}`);
}

function sparklineSvg(obs: number[] = [], pred: number[] = [], riskObs: number[] = [], riskPred: number[] = []) {
  const observed = obs.map(Number).filter(Number.isFinite);
  const forecast = pred.map(Number).filter(Number.isFinite);
  const riskObserved = riskObs.map(Number).filter(Number.isFinite);
  const riskForecast = riskPred.map(Number).filter(Number.isFinite);
  const all = [...observed, ...forecast, ...riskObserved, ...riskForecast];
  if (!all.length) return "<div class='text-xs text-slate-400'>No forecast data</div>";
  const w = 360;
  const h = 120;
  const pad = 10;
  const maxV = Math.max(...all, 1);
  const minV = Math.min(...all, 0);
  const scaleX = (i: number) => pad + (i * (w - pad * 2)) / Math.max(all.length - 1, 1);
  const scaleY = (v: number) => h - pad - ((v - minV) * (h - pad * 2)) / Math.max(maxV - minV, 1e-6);
  const obsPath = observed.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`).join(" ");
  const predStart = observed.length ? observed.length - 1 : 0;
  const predPath = forecast.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(predStart + i)},${scaleY(v)}`).join(" ");
  const riskObsPath = riskObserved.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`).join(" ");
  const riskPredPath = riskForecast.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(predStart + i)},${scaleY(v)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="120" role="img" aria-label="Observed and forecast trajectory">
    <path d="${obsPath}" fill="none" stroke="#2563eb" stroke-width="2.4"></path>
    <path d="${predPath}" fill="none" stroke="#dc2626" stroke-dasharray="5 4" stroke-width="2.4"></path>
    <path d="${riskObsPath}" fill="none" stroke="#f59e0b" stroke-width="2"></path>
    <path d="${riskPredPath}" fill="none" stroke="#f59e0b" stroke-dasharray="3 3" stroke-width="2"></path>
  </svg>`;
}

export default async function NarrativeTemporalAnalysisPage() {
  const payload = await readViralEngineSnapshot();
  const rows = Array.isArray(payload.narratives) ? payload.narratives : [];
  const modelUsage = payload.summary?.model_usage?.forecast || "n/a";

  const temporal = await readTemporalSnapshot();
  const interactiveAnalytics = await fetchJson<any>("/api/interactive-intelligence-analytics");
  const temporalCharts = temporal?.temporal_intelligence_analytics?.charts || {};
  const temporalCount = temporal?.summary?.narratives ?? (temporal?.narrative_evolution_timeline?.narratives?.length ?? 0);
  const temporalGenerated = temporal?.generated_at;
  const analyticsOrder: Array<[string, string]> = [
    ["narrative_momentum_timeline", "Narrative Momentum Timeline"],
    ["global_migration_timeline", "Global Narrative Spread / World Trend Migration Timeline"],
    ["temporal_risk_escalation", "Temporal Risk Escalation"],
    ["prediction_confidence_distribution", "Prediction Confidence Distribution"],
  ];

  const sectionIconClass = "mr-2 h-4 w-4 text-sky-300";

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(56,68,99,0.45),rgba(15,23,42,0.98)_48%,rgba(2,6,23,1)_100%)] px-3 py-4 text-slate-100 sm:px-4 sm:py-6 lg:px-8 lg:py-10">
      <section className="w-full min-w-0 max-w-full overflow-x-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(10,20,42,0.62)] p-3 text-slate-100 shadow-[0_16px_40px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5 pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 max-w-full">
            <h2 className="text-[18px] font-semibold tracking-tight text-white">Temporal Narrative Intelligence</h2>
          </div>
          <Link
            href="/analyzer/narrative_intelligence/dashboard"
            className="inline-flex w-fit max-w-full shrink-0 items-center rounded-full border border-cyan-300/20 bg-[linear-gradient(90deg,rgba(34,211,238,0.16),rgba(59,130,246,0.16))] px-4 py-2 text-xs font-medium text-cyan-50 shadow-[0_10px_24px_rgba(8,145,178,0.16)] transition hover:border-cyan-200/40 hover:bg-[linear-gradient(90deg,rgba(34,211,238,0.24),rgba(59,130,246,0.24))] hover:text-white"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-3 text-sm text-slate-200 shadow-[0_12px_32px_rgba(2,8,23,0.28)] sm:p-4">
          <h3 className="mb-2 flex items-center text-sm font-medium text-white">
            <TrendingUp className={sectionIconClass} />
            Viral Acceleration Engine
          </h3>
          <div className="w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-2 text-sm text-slate-200 shadow-[0_12px_32px_rgba(2,8,23,0.28)] sm:p-3">
            <div className="max-h-105 overflow-y-auto overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_rgba(15,23,42,0.35)]">
              <table className="w-max min-w-full table-fixed text-left text-xs">
                <thead className="bg-slate-900/90">
                  <tr className="text-[12px] font-semibold text-slate-100">
                    <th className="w-[24%] px-1.5 py-2 whitespace-nowrap">Narrative</th>
                    <th className="w-[5%] px-1.5 py-2 whitespace-nowrap">Repeat</th>
                    <th className="w-[9%] px-1.5 py-2 whitespace-nowrap">First Seen</th>
                    <th className="w-[9%] px-1.5 py-2 whitespace-nowrap">Last Seen</th>
                    <th className="w-[8%] px-1.5 py-2 whitespace-nowrap">Pattern</th>
                    <th className="w-[6%] px-1.5 py-2 whitespace-nowrap">NSRI</th>
                    <th className="w-[8%] px-1.5 py-2 whitespace-nowrap">Truth</th>
                    <th className="w-[7%] px-1.5 py-2 whitespace-nowrap">Spike %</th>
                    <th className="w-[8%] px-1.5 py-2 whitespace-nowrap">Peak</th>
                    <th className="w-[7%] px-1.5 py-2 whitespace-nowrap">24h</th>
                    <th className="w-[7%] px-1.5 py-2 whitespace-nowrap">48h</th>
                    <th className="w-[6%] px-1.5 py-2 whitespace-nowrap">Conf.</th>
                    <th className="w-[6%] px-1.5 py-2 whitespace-nowrap">Stab.</th>
                    <th className="w-[8%] px-1.5 py-2 whitespace-nowrap">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? rows.map((row, index) => (
                    <Fragment key={`${row.canonical_narrative || index}`}>
                    <tr key={`${row.canonical_narrative || index}`} className={`align-top border-t border-white/10 ${index % 2 === 0 ? "bg-[rgba(7,15,34,0.42)]" : "bg-[rgba(2,6,23,0.28)]"}`}>
                      <td className="px-1.5 py-2 wrap-break-word">
                        <details>
                          <summary className="cursor-pointer list-none wrap-break-word">
                            {cleanDisplayText(row.canonical_summary || row.canonical_narrative || "").slice(0, 170)}
                          </summary>
                          <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-[rgba(2,6,23,0.45)] p-2 text-[11px] text-slate-300">
                            <div><span className="text-slate-400">Pattern:</span> {clean(row.pattern || "-")}</div>
                            <div><span className="text-slate-400">Stability:</span> {clean(row.narrative_stability || "-")}</div>
                            <div><span className="text-slate-400">Peak:</span> {fmtTime(row.peak_time)}</div>
                          </div>
                        </details>
                      </td>
                      <td className="px-1.5 py-2">{row.repeat_count ?? 0}</td>
                      <td className="px-1.5 py-2 text-[11px] whitespace-nowrap">{fmtTime(row.first_seen_at)}</td>
                      <td className="px-1.5 py-2 text-[11px] whitespace-nowrap">{fmtTime(row.last_seen_at)}</td>
                      <td className="px-1.5 py-2 wrap-break-word">{row.pattern || "-"}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">{fmt(num(row.nsri_current))}</td>
                      <td className="px-1.5 py-2 wrap-break-word">{row.truth_status_current || "-"}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">{fmt(num(row.spike_percent))}%</td>
                      <td className="px-1.5 py-2 text-[11px] whitespace-nowrap">{fmtTime(row.peak_time)}</td>
                      <td className={`px-1.5 py-2 wrap-break-word font-medium ${trendClass(row.prediction_24h_direction)}`}>
                        {row.prediction_24h_direction || fmt(num(row.prediction_24h))}
                      </td>
                      <td className={`px-1.5 py-2 wrap-break-word font-medium ${trendClass(row.prediction_48h_direction)}`}>
                        {row.prediction_48h_direction || fmt(num(row.prediction_48h))}
                      </td>
                      <td className="px-1.5 py-2 whitespace-nowrap">{fmt(num(row.confidence))}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">{fmt(num(row.stability_score))}</td>
                      <td className="px-1.5 py-2 text-center">
                        <span
                          className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap ${riskBadgeClass(row.risk)}`}
                          title={row.risk || "-"}
                        >
                          {row.risk || "Unknown"}
                        </span>
                      </td>
                    </tr>
                    {row.forecast_chart_path || row.forecast_chart_url || row.graph_url ? (
                      <tr key={`${row.canonical_narrative || index}-graph`} className={`border-t border-white/10 ${index % 2 === 0 ? "bg-[rgba(7,15,34,0.28)]" : "bg-[rgba(2,6,23,0.18)]"}`}>
                        <td className="px-2 pb-4 pt-0" colSpan={14}>
                          <details className="group inline-block w-full max-w-110 pt-2">
                            <summary className="flex w-full cursor-pointer list-none items-center rounded-full border border-white/10 bg-[rgba(7,15,34,0.92)] px-4 py-2.5 text-sm text-slate-200 shadow-[0_8px_24px_rgba(2,8,23,0.28)] hover:bg-[rgba(10,20,42,0.96)]">
                              <ChartColumnIncreasing className="mr-2 h-4 w-4 text-slate-300" />
                              <span className="text-[14px] font-medium text-slate-100">Forecast Graph</span>
                              <span className="ml-auto inline-flex text-base leading-none text-slate-300 transition-transform duration-200 group-open:rotate-90">
                                ▶
                              </span>
                            </summary>
                            <div className="mt-2 flex justify-start">
                              <img
                                src={resolveTrinetraAssetUrl(row.forecast_chart_path || row.forecast_chart_url || row.graph_url || "")}
                                alt="Forecast Graph"
                                className="h-auto w-full max-w-155 rounded-lg border border-white/10 bg-[rgba(7,15,34,0.75)]"
                              />
                            </div>
                            <div className="mt-2 max-w-155 text-[11px] text-slate-400">
                              Pattern: {clean(row.pattern || "-")} | Peak: {fmtTime(row.peak_time)} | 24h: {row.prediction_24h_direction || fmt(num(row.prediction_24h))} | 48h: {row.prediction_48h_direction || fmt(num(row.prediction_48h))} | Stability: {clean(row.narrative_stability || "-")}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                  )) : (
                    <tr>
                      <td className="px-3 py-2 text-slate-300" colSpan={14}>No viral acceleration narratives yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-2 sm:p-3">
            <h3 className="mb-2 flex items-center text-sm font-medium text-white">
              <Activity className={sectionIconClass} />
              Narrative Evolution Timeline
            </h3>
            <div className="w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-2 text-sm text-slate-200 shadow-[0_12px_32px_rgba(2,8,23,0.28)] sm:p-3">
              <div className="mt-2 max-h-105 overflow-y-auto overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_rgba(15,23,42,0.35)]">
                <table className="w-full min-w-230 table-fixed text-left text-sm">
                <thead className="bg-slate-900/90">
                    <tr className="text-[13px] font-semibold text-slate-100">
                      <th className="w-[30%] px-3 py-2">Narrative</th>
                      <th className="w-[8%] px-3 py-2">Repeat</th>
                      <th className="w-[16%] px-3 py-2">First Seen</th>
                      <th className="w-[16%] px-3 py-2">Last Seen</th>
                      <th className="w-[10%] px-3 py-2">Lifecycle</th>
                      <th className="w-[8%] px-3 py-2">NSRI</th>
                      <th className="w-[10%] px-3 py-2">Truth</th>
                      <th className="w-[12%] px-3 py-2">Platforms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(temporal?.narrative_evolution_timeline?.narratives || []).map((n: any) => {
                      const nsriVal = Array.isArray(n.nsri_evolution) && n.nsri_evolution.length ? n.nsri_evolution[n.nsri_evolution.length - 1] : (typeof n.nsri === 'number' ? n.nsri : null);
                      const truth = Array.isArray(n.truth_status_transitions) && n.truth_status_transitions.length ? n.truth_status_transitions[n.truth_status_transitions.length - 1] : (n.truth_status || n.truth || "-");
                      const platforms = Array.isArray(n.platform_spread) ? n.platform_spread.join(", ") : (n.platform_spread || "-");
                      return (
                        <tr key={n.canonical_id || n.narrative_key} className="align-top border-t border-white/10">
                          <td className="px-3 py-2 wrap-break-word">{n.canonical_narrative || n.headline || n.narrative_key}</td>
                          <td className="px-3 py-2">{n.repeat_frequency ?? "-"}</td>
                          <td className="px-3 py-2 text-xs">{fmtTime(n.first_seen_at)}</td>
                          <td className="px-3 py-2 text-xs">{fmtTime(n.last_seen_at)}</td>
                          <td className="px-3 py-2">{n.lifecycle ?? "-"}</td>
                          <td className="px-3 py-2">{nsriVal != null ? Number(nsriVal).toFixed(3) : "-"}</td>
                          <td className="px-3 py-2">{truth}</td>
                          <td className="px-3 py-2 wrap-break-word">{platforms}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-2 sm:p-3">
            <h3 className="mb-2 flex items-center text-sm font-medium text-white">
              <ShieldAlert className={sectionIconClass} />
              Narrative Resurgence Alerts
            </h3>
            <div className="w-full min-w-0 rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-3 text-sm text-slate-200 shadow-[0_12px_32px_rgba(2,8,23,0.28)]">
              {(() => {
                const resurgence = temporal?.narrative_resurgence_alerts || { items: [] };
                const items = Array.isArray(resurgence.items) ? resurgence.items : [];
                return (
                  <div>
                    <div className="mb-2 text-xs text-slate-400">{`${resurgence.count || 0} resurgence alerts`}</div>
                    <div className="overflow-auto max-h-64 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_rgba(15,23,42,0.35)]">
                      <table className="min-w-195 text-left text-sm">
                        <thead className="bg-slate-900/90">
                          <tr className="text-[13px] font-semibold text-slate-100">
                            <th className="px-3 py-2">Narrative</th>
                            <th className="px-3 py-2">Alert</th>
                            <th className="px-3 py-2">Dormant Windows</th>
                            <th className="px-3 py-2">Spike %</th>
                            <th className="px-3 py-2">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length ? items.map((r: any, i: number) => (
                            <tr key={i} className="align-top border-t border-white/10">
                              <td className="px-3 py-2 max-w-105 wrap-break-word">{cleanDisplayText(r.narrative || "", { titleCase: false }).slice(0, 160)}</td>
                              <td className="px-3 py-2">{r.label || ""}</td>
                              <td className="px-3 py-2 score">{r.dormant_windows ?? 0}</td>
                              <td className="px-3 py-2 score">{fmt(num(r.spike_percent))}%</td>
                              <td className="px-3 py-2">{r.risk || "-"}</td>
                            </tr>
                          )) : (
                            <tr><td className="px-3 py-2" colSpan={5}>No resurgence alerts yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-2 sm:p-3">
            <h3 className="mb-2 flex items-center text-sm font-medium text-white">
              <Globe2 className={sectionIconClass} />
              Global Narrative Spread / World Trend Migration Timeline
            </h3>
            {(() => {
              const migration = temporal?.global_narrative_spread || { items: [] };
              const items = Array.isArray(migration.items) ? migration.items.slice(0, 60) : [];
              return (
                <Fragment>
                  <div className="mb-2 text-xs text-slate-400">{`${migration.count || 0} migration narratives`}</div>
                  <div className="w-full max-w-full overflow-auto max-h-80 rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] shadow-[0_12px_32px_rgba(2,8,23,0.28)] [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_rgba(15,23,42,0.35)]">
                    <table className="min-w-190 text-left text-sm">
                      <thead className="bg-slate-900/90">
                        <tr className="text-[13px] font-semibold text-slate-100">
                          <th className="px-3 py-2">Narrative</th>
                          <th className="px-3 py-2">Countries</th>
                          <th className="px-3 py-2">Platforms</th>
                          <th className="px-3 py-2">Country Count</th>
                          <th className="px-3 py-2">Platform Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length ? items.map((m: any, idx: number) => (
                          <tr key={`${idx}-${cleanDisplayText(m.headline || "migration", { titleCase: false })}`} className="border-t border-white/10 align-top">
                            <td className="px-3 py-2 max-w-105 wrap-break-word">{cleanDisplayText(m.headline || "").slice(0, 150)}</td>
                            <td className="px-3 py-2">{Array.isArray(m.countries) ? m.countries.join(", ") : ""}</td>
                            <td className="px-3 py-2">{Array.isArray(m.platforms) ? m.platforms.join(", ") : ""}</td>
                            <td className="px-3 py-2 score">{m.country_count ?? 0}</td>
                            <td className="px-3 py-2 score">{m.platform_count ?? 0}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td className="px-3 py-2" colSpan={5}>No migration data yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Fragment>
              );
            })()}
          </div>

        <div className="mb-4">
            <div className="mt-4 rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-2 sm:p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="flex items-center text-sm font-medium text-white">
                    <ChartColumnIncreasing className={sectionIconClass} />
                    Temporal Intelligence Analytics
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Matplotlib charts: {Object.keys(temporalCharts).length} | enabled: {temporal?.temporal_intelligence_analytics?.matplotlib_enabled ? "yes" : "no"}
                  </p>
                </div>
              </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {analyticsOrder.map(([key, title]) => {
                  const src = temporalCharts?.[key];
                  const isRiskEscalation = key === "temporal_risk_escalation";
                  return (
                    <div
                      key={key}
                      className={`overflow-hidden rounded-2xl border border-white/10 bg-[rgba(2,6,23,0.35)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${
                        isRiskEscalation ? "flex min-h-70 flex-col" : ""
                      }`}
                    >
                      <h4 className="mb-2 text-sm font-medium text-white">{title}</h4>
                      {src ? (
                        <div className={`overflow-hidden rounded-xl border border-white/10 bg-white p-2 ${isRiskEscalation ? "flex flex-1" : ""}`}>
                          <img
                            src={resolveTrinetraAssetUrl(src)}
                            alt={title}
                            className={`block w-full rounded-lg bg-white object-contain ${
                              isRiskEscalation ? "h-full max-h-50 self-stretch" : ""
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="flex min-h-75 items-center justify-center rounded-xl border border-dashed border-white/20 px-3 py-8 text-center text-sm text-slate-300">
                          Not generated yet
                        </div>
                      )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <InteractiveIntelligenceAnalytics payload={interactiveAnalytics ?? null} />
          </div>
      </section>
    </div>
  );
}
