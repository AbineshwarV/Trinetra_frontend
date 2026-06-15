import path from "node:path";
import { readFile } from "node:fs/promises";
import Link from "next/link";
import Top10Carousel from "./top10-carousel";
import Top10BarChart from "./top10-bar-chart";
import SocialTrendsSection from "./social-trends-section";
import WorldMap from "./world-map";
import LiveTrendingTable from "./live-trending-table";
import {
  Activity,
  CalendarClock,
  Clock3,
  Database,
  Globe2,
  Layers,
  Play,
  Radar,
  ShieldCheck,
  Timer,
  Users,
} from "lucide-react";

type QualityGateRecord = {
  clean_text?: string | null;
  platform?: string | null;
  sector?: string | null;
  keywords?: string[];
  region?: string | null;
  threat_score?: number | null;
  engagement?: Record<string, unknown> | null;
};

type QualityGatePayload = {
  generated_at?: string;
  record_count?: number;
  records?: QualityGateRecord[];
};

type WorldTopPayload = {
  generated_at?: string;
  top_10_around_world?: Array<{
    rank?: number;
    headline?: string;
    summary?: string;
    category?: string;
    platforms?: string[];
    regions?: string[];
    keywords?: string[];
    sources_used?: string[];
    viral_rank_score?: number;
    trend_score?: number;
    nsri_score?: number;
    truth_status?: string;
    why_ranked?: string;
  }>;
};

type SchedulerStatusPayload = {
  status?: string;
  interval_minutes?: number | null;
  connector?: string | null;
  last_run_started_at?: string | null;
  last_run_finished_at?: string | null;
  next_run_at?: string | null;
  updated_at?: string | null;
  overdue?: boolean;
  message?: string | null;
};

type ReportPayload = {
  records_read?: number;
  records_after_quality_gate?: number;
  clusters?: number;
  quality_records?: { record_count?: number };
  narrative_intelligence?: {
    louvain_communities?: number;
    communities?: number;
    graph_edges?: number;
  };
  overall_top_15?: Array<Record<string, any>>;
  top_10_trending?: Array<Record<string, any>>;
  social_trend_intelligence?: SocialTrendsPayload;
};

type SocialTrendItem = {
  trending_story?: string;
  summary?: string;
  category?: string;
  social_media_apps?: string[];
  geographic_spread?: string[];
  keywords?: string[];
  trend_score?: number;
  truth_status?: string;
  nsri?: { score?: number };
  amplification?: string;
};

type SocialTrendsPayload = {
  top_25?: SocialTrendItem[];
};

type InteractiveIntelligenceAnalyticsPayload = {
  generated_at?: string;
  latest_item_count?: number;
  snapshot_point_count?: number;
  platform_influence?: Array<{
    platform?: string;
    influence_score?: number;
    total_narratives?: number;
    total_contribution?: number;
    avg_nsri?: number;
    avg_velocity?: number;
  }>;
  competition_timeline?: Array<{
    name?: string;
    x?: string[];
    y?: number[];
  }>;
  truth_landscape_image?: string;
  velocity_distribution_image?: string;
};

type TrendHistoryPayload = {
  items?: Record<string, any>;
};

type TopMetric = {
  title: string;
  value: string;
  Icon: typeof Activity;
  tone: "violet" | "green" | "blue" | "purple" | "pink" | "amber";
};

type BottomMetric = {
  title: string;
  value: string;
  subtitle: string;
  Icon: typeof Activity;
  tone: "teal" | "violet" | "purple" | "amber";
  badge?: { label: string; tone: "success" | "muted" };
};

const toneStyles: Record<TopMetric["tone"], { frame: string; glow: string; wave: string; accent: string; waveTint: string }> = {
  violet: {
    frame: "border-(--app-shell-card-border) bg-(--app-shell-card)",
    glow: "shadow-[0_16px_34px_rgba(5,10,24,0.45)]",
    wave: "from-violet-500/40 via-violet-400/20 to-transparent",
    accent: "bg-violet-500/20 text-violet-200",
    waveTint: "text-violet-400/40",
  },
  green: {
    frame: "border-(--app-shell-card-border) bg-(--app-shell-card)",
    glow: "shadow-[0_16px_34px_rgba(5,10,24,0.45)]",
    wave: "from-emerald-500/40 via-emerald-400/20 to-transparent",
    accent: "bg-emerald-500/20 text-emerald-200",
    waveTint: "text-emerald-400/40",
  },
  blue: {
    frame: "border-(--app-shell-card-border) bg-(--app-shell-card)",
    glow: "shadow-[0_16px_34px_rgba(5,10,24,0.45)]",
    wave: "from-sky-500/40 via-sky-400/20 to-transparent",
    accent: "bg-sky-500/20 text-sky-200",
    waveTint: "text-sky-400/40",
  },
  purple: {
    frame: "border-(--app-shell-card-border) bg-(--app-shell-card)",
    glow: "shadow-[0_16px_34px_rgba(5,10,24,0.45)]",
    wave: "from-purple-500/40 via-purple-400/20 to-transparent",
    accent: "bg-purple-500/20 text-purple-200",
    waveTint: "text-purple-400/40",
  },
  pink: {
    frame: "border-(--app-shell-card-border) bg-(--app-shell-card)",
    glow: "shadow-[0_16px_34px_rgba(5,10,24,0.45)]",
    wave: "from-pink-500/40 via-pink-400/20 to-transparent",
    accent: "bg-pink-500/20 text-pink-200",
    waveTint: "text-pink-400/40",
  },
  amber: {
    frame: "border-(--app-shell-card-border) bg-(--app-shell-card)",
    glow: "shadow-[0_16px_34px_rgba(5,10,24,0.45)]",
    wave: "from-amber-400/45 via-amber-300/20 to-transparent",
    accent: "bg-amber-500/20 text-amber-200",
    waveTint: "text-amber-300/40",
  },
};

function TopMetricCard({ metric }: { metric: TopMetric }) {
  const tone = toneStyles[metric.tone];
  return (
    <section className={`relative overflow-hidden rounded-2xl border px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5 ${tone.frame} ${tone.glow}`}>
      <div className="absolute inset-0">
        <svg className={`absolute bottom-0 left-0 right-0 h-16 w-full ${tone.waveTint}`} viewBox="0 0 360 64" preserveAspectRatio="none">
          <path
            d="M0 42 C 48 30 96 50 144 40 C 192 30 240 48 288 38 C 316 32 336 42 360 36 L360 64 L0 64 Z"
            fill="currentColor"
            opacity="0.22"
          />
          <path
            d="M0 50 C 60 42 120 54 180 46 C 240 38 300 52 360 44 L360 64 L0 64 Z"
            fill="currentColor"
            opacity="0.12"
          />
        </svg>
      </div>
      <div className="relative z-10">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 sm:h-12 sm:w-12 ${tone.accent}`}>
          <metric.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <p className="mt-4 text-[12px] font-medium text-slate-200 sm:mt-5 sm:text-[13px]">{metric.title}</p>
        <p className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl">{metric.value}</p>
      </div>
    </section>
  );
}

function BottomStatusCard({ metrics }: { metrics: BottomMetric[] }) {
  return (
    <section className="rounded-2xl border border-(--app-shell-card-border) bg-(--app-shell-card) shadow-[0_20px_50px_rgba(5,10,24,0.5)]">
      <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const borderClass = index === 0 ? "" : "sm:border-l sm:border-white/10 xl:border-l xl:border-white/10";
          return (
            <div key={metric.title} className={`flex min-w-0 flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6 ${borderClass}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:h-10 sm:w-10">
                  <metric.Icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
                <p className="min-w-0 text-sm font-medium text-slate-200">{metric.title}</p>
              </div>
              <p className="text-lg font-semibold text-white sm:text-xl">{metric.value}</p>
              <div className="flex items-center gap-2">
                {metric.badge ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      metric.badge.tone === "success"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-white/5 text-slate-300"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {metric.badge.label}
                  </span>
                ) : null}
                <span className="text-xs text-slate-400">{metric.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

async function readJson<T>(relativePath: string): Promise<T | null> {
  const filePath = path.join(process.cwd(), "..", relativePath);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const TRINETRA_USECASE_2_BASE_URL =
  process.env.TRINETRA_USECASE_2_BASE_URL ||
  process.env.NEXT_PUBLIC_TRINETRA_USECASE_2_BASE_URL ||
  "http://127.0.0.1:8080";

function buildTrinetraUrl(endpoint: string) {
  const base = TRINETRA_USECASE_2_BASE_URL.endsWith("/")
    ? TRINETRA_USECASE_2_BASE_URL.slice(0, -1)
    : TRINETRA_USECASE_2_BASE_URL;
  return `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
}


async function fetchTrinetra<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(buildTrinetraUrl(endpoint), { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatNumber(value: number | null, fallback = "—") {
  if (value === null || Number.isNaN(value)) return fallback;
  return new Intl.NumberFormat("en-US").format(value);
}

function formatList(values: Array<string | null | undefined>, fallback = "—") {
  const cleaned = values.filter((value): value is string => Boolean(value && value.trim()));
  return cleaned.length ? cleaned.join(", ") : fallback;
}

function formatTimestamp(value: string | undefined) {
  if (!value) return "Pending backend";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending backend";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function timeUntil(value: string | undefined) {
  if (!value) return "-";
  const ms = new Date(value).getTime() - Date.now();
  if (!Number.isFinite(ms)) return "-";
  if (ms <= 0) return "due now";
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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

function termRatio(text: string, terms: string[]) {
  const words = new Set(String(text || "").toLowerCase().split(/\s+/).filter(Boolean));
  if (!words.size) return 0;
  const hits = terms.filter((term) => words.has(term)).length;
  return Math.min(hits / 3, 1);
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
  text = text.replace(new RegExp(`\\s+(?:${sourceNamesPattern()})(?:\\s+|$).*`, "i"), "");
  text = text.replace(/\s+/g, " ").trim();
  return titleCase ? toTitleCase(text) : text;
}

function itemKey(item: { claim?: string; narrative?: string }) {
  const claim = cleanDisplayText(item.claim || item.narrative || "", { titleCase: false }).toLowerCase();
  return claim.slice(0, 90);
}

function uniqueItems(items: Array<{ claim?: string; narrative?: string }>) {
  const seen = new Set<string>();
  const out: Array<{ claim?: string; narrative?: string }> = [];
  for (const item of items || []) {
    const key = itemKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function readableHeadline(value: string) {
  const clean = cleanDisplayText(value || "");
  const words = clean.split(/\s+/).filter(Boolean);
  const limit = 18;
  return words.length > limit ? `${words.slice(0, limit).join(" ")}...` : clean;
}

function nsriBand(score: number) {
  if (score >= 75) return "Severe";
  if (score >= 50) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

function nsriIndicates(score: number) {
  if (score >= 75) return "Severe risk: investigate urgently for manipulation, synthetic media, or coordinated amplification.";
  if (score >= 50) return "High risk: verify claims and monitor acceleration across platforms.";
  if (score >= 25) return "Moderate risk: social momentum is visible but manipulation evidence is limited.";
  return "Low risk: trend appears relatively stable from available evidence.";
}

function nsriLegend(params: Record<string, number>) {
  const pct = (value: number) => `${Math.round(value * 100)}%`;
  return [
    `synthetic: AI/deepfake/generated signs ${pct(params.synthetic_probability_score || 0)}`,
    `propagation: spread speed ${pct(params.propagation_velocity_gradient || 0)}`,
    `weak-source risk: low credibility / unverifiable sourcing ${pct(params.trust_signal_score || 0)}`,
    `sentiment: emotional risk ${pct(params.sentiment_risk_score || 0)}`,
    `coordination: artificial boost signs ${pct(params.coordination_density_coefficient || 0)}`,
  ].join(" | ");
}

function nsriView(item: any) {
  const params = item.nsri?.parameters || {};
  const md = item.metadata || {};
  const parameters = {
    synthetic_probability_score: params.synthetic_probability_score ?? 0,
    propagation_velocity_gradient: params.propagation_velocity_gradient ?? Math.max(0, Math.min(Number(item.trend_score || 0) / 100, 1)),
    trust_signal_score: params.trust_signal_score ?? params.influencer_centrality_weight ?? (md.trusted_source_ratio == null ? 0.5 : 1 - md.trusted_source_ratio),
    viral_pattern_score: 0,
    sentiment_risk_score: params.sentiment_risk_score ?? params.sentiment_deviation_index ?? 0,
    coordination_density_coefficient: params.coordination_density_coefficient ?? (md.coordinated_cluster ? 0.85 : 0),
  };
  const score = typeof item.nsri?.score === "number"
    ? item.nsri.score
    : (
        parameters.synthetic_probability_score * 0.2
        + parameters.propagation_velocity_gradient * 0.22
        + parameters.trust_signal_score * 0.18
        + parameters.sentiment_risk_score * 0.15
        + parameters.coordination_density_coefficient * 0.1
      ) * 100;
  return {
    score: Math.round(score * 100) / 100,
    parameters,
    risk_band: item.nsri?.risk_band || nsriBand(score),
    indicates: item.nsri?.indicates || nsriIndicates(score),
  };
}

function nsriWeightedScore(item: any) {
  const nsriScore = nsriView(item).score || 0;
  return nsriScore * 0.8 + Math.min(Number(item.trend_score || item.ranking_score || 0), 100) * 0.2;
}

function trendToDashboardItem(trend: SocialTrendItem) {
  const synthetic = termRatio(trend.trending_story || "", ["ai", "deepfake", "fake", "edited", "morphed", "generated", "bot", "hoax", "rumor", "rumour"]);
  const sentiment = termRatio([trend.trending_story, trend.summary].join(" "), ["shocking", "urgent", "breaking", "exposed", "warning", "panic", "attack", "scam", "fraud", "leaked"]);
  const propagation = Math.max(0, Math.min(Number(trend.trend_score || 0) / 100, 1));
  const viralPattern = 0;
  const coordination = /coordinated|artificial|boosted/i.test(trend.amplification || "") ? 0.85 : Math.min(((trend.social_media_apps || []).length - 1) * 0.18, 0.5);
  const trustRisk = ["misleading", "under investigation", "unverified"].includes(String(trend.truth_status || "").toLowerCase()) ? 0.68 : 0.28;
  const nsriScore = (
    synthetic * 0.2
    + propagation * 0.22
    + trustRisk * 0.18
    + viralPattern * 0.15
    + sentiment * 0.15
    + coordination * 0.1
  ) * 100;
  return {
    claim: trend.trending_story || "",
    narrative: trend.summary || trend.trending_story || "",
    ranking_score: trend.trend_score || 0,
    trend_score: trend.trend_score || 0,
    verdict: trend.truth_status || "Unverified",
    real_or_fake: trend.truth_status || "Unverified",
    metadata: {
      sector: trend.category || "Social Media",
      platforms: trend.social_media_apps || [],
      regions: trend.geographic_spread || [],
      topic_keywords: trend.keywords || [],
      viral_acceleration: 0,
    },
    nsri: trend.nsri || {
      score: Math.round(nsriScore * 100) / 100,
      risk_band: nsriBand(nsriScore),
      indicates: nsriIndicates(nsriScore),
      parameters: {
        synthetic_probability_score: synthetic,
        propagation_velocity_gradient: propagation,
        trust_signal_score: trustRisk,
        viral_pattern_score: viralPattern,
        sentiment_risk_score: sentiment,
        coordination_density_coefficient: coordination,
      },
    },
    _social_trend: true,
    _live_source: "Social Media Grade",
  };
}

function qualityItemsFromRecords(records: QualityGateRecord[]) {
  return (records || []).map((record) => ({
    claim: record.clean_text || "",
    narrative: record.clean_text || "",
    ranking_score: record.threat_score || 0,
    trend_score: record.threat_score || 0,
    verdict: "Quality Passed",
    real_or_fake: "Quality Passed",
    nsri: {
      score: record.threat_score || 0,
      risk_band: nsriBand(Number(record.threat_score || 0)),
      indicates: nsriIndicates(Number(record.threat_score || 0)),
      parameters: {
        synthetic_probability_score: 0,
        propagation_velocity_gradient: Math.min(Number(record.threat_score || 0) / 100, 1),
        trust_signal_score: 0.28,
        viral_pattern_score: 0,
        sentiment_risk_score: Math.min(Number(record.threat_score || 0) / 100, 1),
        coordination_density_coefficient: 0,
      },
    },
    metadata: {
      sector: record.sector || "India",
      regions: record.region ? [record.region] : [],
      platforms: record.platform ? [record.platform] : [],
      topic_keywords: record.keywords || [],
      viral_acceleration: 0,
    },
    _quality_record: true,
    _live_source: "Quality Grade",
  }));
}

function liveTrendingItems(reportItems: any[], socialTrends: SocialTrendsPayload, records: QualityGateRecord[]) {
  const social = (socialTrends?.top_25 || []).map(trendToDashboardItem).map((item: any) => ({ ...item, _map_source: "Social Trend" }));
  const layer2 = (reportItems || []).map((item: any) => ({ ...item, _live_source: "Layer 2 Top 10" }));
  const quality = qualityItemsFromRecords(records);
  return uniqueItems([...social, ...layer2, ...quality]).sort((a: any, b: any) => nsriWeightedScore(b) - nsriWeightedScore(a));
}

function mapDashboardItems(reportItems: any[], socialTrends: SocialTrendsPayload, records: QualityGateRecord[]) {
  const qualityMapItems = qualityItemsFromRecords(records).map((item: any) => ({ ...item, _map_source: "Quality Record" }));
  const socialMapItems = (socialTrends?.top_25 || []).map(trendToDashboardItem).map((item: any) => ({ ...item, _map_source: "Social Trend" }));
  const fallback = (reportItems || []).map((item: any) => ({ ...item, _map_source: "Layer 2" }));
  const combined = uniqueItems([...qualityMapItems, ...socialMapItems]);
  return combined.length ? combined : fallback;
}

function historyKey(value: string) {
  return cleanDisplayText(value, { titleCase: false })
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .slice(0, 14)
    .join(" ");
}

function historyView(item: any, trendHistory: TrendHistoryPayload | null) {
  const items = trendHistory?.items || {};
  const keys = [historyKey(item.claim || item.narrative), historyKey(item.narrative || item.claim)].filter(Boolean);
  const match = keys.map((key) => items[key]).find(Boolean);
  if (!match) return { badges: [] as string[], summary: "" };
  const parts = [] as string[];
  if (match.top10_last5_count) parts.push(`${match.top10_last5_count}/5 top10`);
  if (match.top10_6h_count && match.top10_6h_total) parts.push(`${match.top10_6h_count}/${match.top10_6h_total} 6h`);
  if (match.top5_2d_count) parts.push(`${match.top5_2d_count} top5 hits`);
  if (match.social_last5_count) parts.push(`${match.social_last5_count}/5 social`);
  if (match.quality_last5_count) parts.push(`${match.quality_last5_count}/5 quality`);
  return {
    badges: match.badges || [],
    summary: parts.join(" | "),
  };
}

export async function NarrativeDashboardContent() {
  const [reportApi, qualityGateApi, worldTopApi, schedulerApi, socialTrendsApi, trendHistoryApi, interactiveAnalyticsApi] = await Promise.all([
    fetchTrinetra<ReportPayload>("/api/report"),
    fetchTrinetra<QualityGatePayload>("/api/after-quality-records"),
    fetchTrinetra<WorldTopPayload>("/api/world-top10"),
    fetchTrinetra<SchedulerStatusPayload>("/api/scheduler-status"),
    fetchTrinetra<SocialTrendsPayload>("/api/social-trends"),
    fetchTrinetra<TrendHistoryPayload>("/api/trend-history"),
    fetchTrinetra<InteractiveIntelligenceAnalyticsPayload>("/api/interactive-intelligence-analytics"),
  ]);
  const [qualityGateLocal, worldTopLocal] = await Promise.all([
    qualityGateApi ? Promise.resolve(null) : readJson<QualityGatePayload>("latest_after_quality_gate_records.json"),
    worldTopApi ? Promise.resolve(null) : readJson<WorldTopPayload>("latest_world_top10.json"),
  ]);
  const report = reportApi ?? null;
  const qualityGate = qualityGateApi ?? qualityGateLocal;
  const worldTop = worldTopApi ?? worldTopLocal;
  const scheduler = schedulerApi ?? null;
  const trendHistory = trendHistoryApi ?? null;
  const interactiveAnalytics = interactiveAnalyticsApi ?? null;
  const dataSourceLabel = reportApi || qualityGateApi || worldTopApi || schedulerApi ? "webapp.py API" : "Local JSON adapter";
  const reportNi = report?.narrative_intelligence || {};
  const louvainCommunities = Number(reportNi.louvain_communities ?? reportNi.communities ?? 0);
  const totalGraphEdges = Number(reportNi.graph_edges ?? 0);

  const socialPayload = socialTrendsApi ?? report?.social_trend_intelligence ?? {};
  const qualityItems = Array.isArray(qualityGate?.records) ? qualityGate.records : [];
  const reportItems = Array.isArray(report?.overall_top_15)
    ? report?.overall_top_15
    : Array.isArray(report?.top_10_trending)
      ? report?.top_10_trending
      : [];
  const mapItems = mapDashboardItems(reportItems, socialPayload as SocialTrendsPayload, qualityItems);
  const mapRecords = Number(mapItems.length);

  const liveTrendingList = liveTrendingItems(reportItems, socialPayload as SocialTrendsPayload, qualityItems);
  const top10Items = liveTrendingList.slice(0, 10);
  const top10Keys = new Set(top10Items.map((entry: any) => itemKey(entry)));
  const liveTrendingRows = liveTrendingList.map((item: any, index: number) => {
    const nsri = nsriView(item);
    const cleanClaim = cleanDisplayText(item.claim || item.narrative || "Untitled intelligence");
    const claim = readableHeadline(item.claim || item.narrative) || cleanClaim;
    const platformsArr = Array.isArray(item.metadata?.platforms)
      ? item.metadata.platforms
      : item.metadata?.platforms
        ? [String(item.metadata.platforms)]
        : item.platform
          ? [String(item.platform)]
          : [];
    const regionsArr = Array.isArray(item.metadata?.regions)
      ? item.metadata.regions
      : item.metadata?.regions
        ? [String(item.metadata.regions)]
        : item.region
          ? [String(item.region)]
          : [];

    return {
      key: `${item.rank ?? index}`,
      rankLabel: `#${index + 1}`,
      isTop10: top10Keys.has(itemKey(item)),
      claim: claim.slice(0, 150),
      source: item._live_source || "Live",
      sector: item.metadata?.sector || item.sector || "-",
      verdict: item.real_or_fake || item.verdict || "-",
      nsriScore: formatNumber(nsri.score),
      weightedScore: formatNumber(nsriWeightedScore(item)),
      trendScore: formatNumber(Number(item.trend_score ?? 0)),
      platforms: formatList(platformsArr.slice(0, 3), "-") ,
      regions: formatList(regionsArr.slice(0, 3), "-"),
    };
  });

  const platformRows = Array.isArray(interactiveAnalytics?.platform_influence)
    ? interactiveAnalytics.platform_influence
        .map((row) => ({
          platform: String(row?.platform || "Unknown"),
          influence_score: Number(row?.influence_score ?? 0),
          total_narratives: Number(row?.total_narratives ?? 0),
          total_contribution: Number(row?.total_contribution ?? 0),
          avg_nsri: Number(row?.avg_nsri ?? 0),
          avg_velocity: Number(row?.avg_velocity ?? 0),
        }))
        .filter((row) => row.platform.trim().length > 0)
    : [];

  const precomputedTop10 = top10Items.map((item: any, index: number) => {
    const nsri = nsriView(item);
    const history = historyView(item, trendHistory);
    const claim = readableHeadline(item.claim || item.narrative) || "Untitled intelligence";
    const claimFull = cleanDisplayText(item.claim || item.narrative || claim, { titleCase: false }) || claim;
    const platformsArr = Array.isArray(item.metadata?.platforms)
      ? item.metadata.platforms
      : item.metadata?.platforms
        ? [String(item.metadata.platforms)]
        : item.platform
          ? [String(item.platform)]
          : [];
    const platforms = formatList((platformsArr || []).slice(0, 2), "source n/a");
    const sector = item.metadata?.sector || item.sector || "General";
    const truth = item.real_or_fake || item.verdict || "Unverified";
    return {
      key: `${item.rank ?? index}`,
      rankLabel: `#${item.rank ?? index + 1}`,
      claim,
      claimFull,
      sector,
      truth,
      platforms,
      nsriScore: formatNumber(nsri.score),
      nsriScoreValue: Number(nsri.score ?? 0),
      weightedScore: formatNumber(nsriWeightedScore(item)),
      weightedScoreValue: nsriWeightedScore(item),
      truthScore: formatNumber(item.truth_score ?? null),
      truthScoreValue: Number(item.truth_score ?? 0),
      trendScore: formatNumber(item.trend_score ?? null),
      trendScoreValue: Number(item.trend_score ?? 0),
      nsriSource: (nsri as any)?.nsri_source ?? "-",
      nsriFormulaVersion: (nsri as any)?.formula_version ?? "-",
      nsriParameters: (nsri as any)?.parameters ?? {},
      nsriLegend: nsriLegend((nsri as any)?.parameters ?? {}),
      nsriRiskBand: (nsri as any)?.risk_band ?? "-",
      nsriIndicates: (nsri as any)?.indicates ?? "-",
      liveSource: item._live_source || "Live Ranking",
      historySummary: history.summary || "",
      recordsCount: item.metadata?.record_count ?? item.cluster_size ?? "-",
      whyRanked: item.why_ranked,
    };
  });

  const records = Array.isArray(qualityGate?.records) ? qualityGate?.records : [];
  const recordCount = Number(report?.records_read ?? qualityGate?.record_count ?? records.length);
  const qualityPassed = Number(report?.records_after_quality_gate ?? qualityGate?.record_count ?? records.length);
  const clusters = Number(report?.clusters ?? (Array.isArray(worldTop?.top_10_around_world) ? worldTop.top_10_around_world.length : 0));
  const lastRun = formatTimestamp(
    scheduler?.last_run_finished_at ?? scheduler?.last_run_started_at,
  );
  const nextRun = formatTimestamp(scheduler?.next_run_at ?? undefined);
  const schedulerStatus = scheduler?.status ?? "unknown";
  const isSchedulerRunning = schedulerStatus === "running" || schedulerStatus === "waiting";
  const isSchedulerOverdue = Boolean(scheduler?.overdue) || schedulerStatus === "overdue";
  const schedulerValue = isSchedulerRunning ? "Running" : isSchedulerOverdue ? "overdue" : schedulerStatus;
  const schedulerBadge = isSchedulerRunning
    ? { label: "Running", tone: "success" as const }
    : { label: "Check", tone: "muted" as const };
  const countdownSubtitle = `${scheduler?.connector || "connector unknown"}${scheduler?.interval_minutes ? ` every ${scheduler.interval_minutes} min` : ""}`;
  const topMetrics: TopMetric[] = [
    { title: "Records Read", value: formatNumber(recordCount), Icon: Database, tone: "violet" },
    { title: "Quality Passed", value: formatNumber(qualityPassed), Icon: ShieldCheck, tone: "green" },
    { title: "Map Records", value: formatNumber(mapRecords), Icon: Globe2, tone: "blue" },
    { title: "Clusters", value: formatNumber(clusters), Icon: Layers, tone: "purple" },
    { title: "Louvain Communities", value: formatNumber(louvainCommunities), Icon: Users, tone: "pink" },
    { title: "Graph Edges", value: formatNumber(totalGraphEdges), Icon: Radar, tone: "amber" },
  ];

  const bottomMetrics: BottomMetric[] = [
    {
      title: "Scheduler",
      value: schedulerValue,
      subtitle: "",
      Icon: CalendarClock,
      tone: "teal",
      badge: schedulerBadge,
    },
    {
      title: "Last Run",
      value: lastRun,
      subtitle: "",
      Icon: Clock3,
      tone: "violet",
    },
    {
      title: "Next Run",
      value: nextRun,
      subtitle: "",
      Icon: Play,
      tone: "purple",
    },
    {
      title: "Countdown",
      value: timeUntil(scheduler?.next_run_at ?? undefined),
      subtitle: countdownSubtitle,
      Icon: Timer,
      tone: "amber",
    },
  ];

  return (
    <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[1.75rem] border border-(--app-shell-card-border) bg-[rgba(10,20,42,0.62)] p-4 shadow-[0_16px_40px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:p-5 lg:p-8">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Pulse - Narrative Intelligence</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Overview of narrative signals, timeline integrity, and behavioral drift.
            </p>
          </div>
          <div className="w-fit shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {dataSourceLabel}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {topMetrics.map((metric) => (
            <TopMetricCard key={metric.title} metric={metric} />
          ))}
        </div>

        <details className="group mt-6 rounded-3xl border border-white/10 bg-white/5">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-4 lg:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white sm:text-xl">Scheduler & Run Status</h2>
              <p className="mt-1 text-xs text-slate-400">Live scheduling telemetry from the backend.</p>
            </div>
            <span className="text-xs text-slate-400 transition group-open:rotate-180">▾</span>
          </summary>
          <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 lg:px-6">
            <BottomStatusCard metrics={bottomMetrics} />
          </div>
        </details>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:p-6">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white sm:text-xl">Top 10</h2>
              <p className="mt-1 text-xs text-slate-400">Live ranking from world trends, social signals, and quality records.</p>
            </div>
            <Link
              href="/analyzer/narrative_intelligence/top10"
              className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/20"
            >
              View full list
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2">
              {/* @ts-ignore server->client prop */}
              <Top10Carousel items={precomputedTop10} />
              <Top10BarChart items={precomputedTop10} platformRows={platformRows} />
            </div>
            <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-3 shadow-[0_12px_32px_rgba(2,8,23,0.28)] sm:p-4 lg:min-h-125">
              {/* @ts-ignore server->client prop */}
              <WorldMap items={mapItems} />
            </div>

            <SocialTrendsSection payload={socialPayload as SocialTrendsPayload} items={socialPayload?.top_25 || []} />

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(7,15,34,0.55)] p-3 shadow-[0_12px_32px_rgba(2,8,23,0.28)] sm:p-4 lg:p-5">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white sm:text-xl">Live Trending</h2>
                  <p className="mt-1 text-xs text-slate-400">Live records from Quality Grade, Social Media Grade, and Layer 2 Top 10.</p>
                </div>
              </div>

              <LiveTrendingTable rows={liveTrendingRows} />
            </section>

          </div>
        </section>

      </section>
    </div>
  );
}

export async function NarrativeTop10Content() {
  const [reportApi, qualityGateApi, socialTrendsApi, trendHistoryApi, interactiveAnalyticsApi] = await Promise.all([
    fetchTrinetra<ReportPayload>("/api/report"),
    fetchTrinetra<QualityGatePayload>("/api/after-quality-records"),
    fetchTrinetra<SocialTrendsPayload>("/api/social-trends"),
    fetchTrinetra<TrendHistoryPayload>("/api/trend-history"),
    fetchTrinetra<InteractiveIntelligenceAnalyticsPayload>("/api/interactive-intelligence-analytics"),
  ]);
  const report = reportApi ?? null;
  const qualityGate = qualityGateApi ?? null;
  const socialPayload = socialTrendsApi ?? report?.social_trend_intelligence ?? {};
  const trendHistory = trendHistoryApi ?? null;
  const interactiveAnalytics = interactiveAnalyticsApi ?? null;
  const qualityItems = Array.isArray(qualityGate?.records) ? qualityGate.records : [];
  const reportItems = Array.isArray(report?.overall_top_15)
    ? report?.overall_top_15
    : Array.isArray(report?.top_10_trending)
      ? report?.top_10_trending
      : [];
  const top10Items = liveTrendingItems(reportItems, socialPayload as SocialTrendsPayload, qualityItems);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[1.75rem] border border-(--app-shell-card-border) bg-[rgba(10,20,42,0.62)] p-5 shadow-[0_16px_40px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Top 10</h1>
            <p className="mt-2 text-sm text-slate-300">Live ranking from world trends, social signals, and quality records.</p>
          </div>
          <Link
            href="/analyzer/narrative_intelligence/dashboard"
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/20"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top10Items.slice(0, 10).length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[rgba(10,20,42,0.5)] px-4 py-6 text-sm text-slate-300">
              Top 10 list is not available yet. Start the webapp pipeline to generate world rankings.
            </div>
          ) : (
            top10Items.slice(0, 10).map((item: any, index: number) => {
              const nsri = nsriView(item);
              const history = historyView(item, trendHistory);
              const claim = readableHeadline(item.claim || item.narrative) || "Untitled intelligence";
              const summary = cleanDisplayText(item.narrative || item.claim, { titleCase: false });
              const displaySummary = summary && summary.toLowerCase() !== claim.toLowerCase()
                ? summary.slice(0, 170)
                : "No separate summary available.";
              const platforms = Array.isArray(item.metadata?.platforms)
                ? item.metadata.platforms
                : item.metadata?.platforms
                  ? [String(item.metadata.platforms)]
                  : item.platform
                    ? [String(item.platform)]
                    : [];
              const sector = item.metadata?.sector || item.sector || "General";
              const truth = item.real_or_fake || item.verdict || "Unverified";
              return (
                <article
                  key={`${item.rank ?? index}`}
                  className="relative rounded-2xl border border-slate-700/40 bg-[rgba(7,15,34,0.82)] px-5 py-4 shadow-[0_14px_40px_rgba(3,8,23,0.4)]"
                >
                  <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-xs font-semibold text-white">
                    #{item.rank ?? index + 1}
                  </span>
                  <h3 className="pr-12 text-lg font-semibold text-white">{claim}</h3>
                  <p className="mt-3 text-sm text-slate-300 line-clamp-3">{displaySummary}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{sector}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{truth}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{formatList((platforms || []).slice(0, 2), "source n/a")}</span>
                    {history.badges.map((badge: string) => (
                      <span key={badge} className="rounded-full border border-amber-300/40 bg-amber-500/10 px-2.5 py-1 text-amber-200">
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-200">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">NSRI</span>
                      <p className="mt-1 text-sm font-semibold text-white">{formatNumber(nsri.score)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Weighted</span>
                      <p className="mt-1 text-sm font-semibold text-white">{formatNumber(nsriWeightedScore(item))}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Truth</span>
                      <p className="mt-1 text-sm font-semibold text-white">{formatNumber(item.truth_score ?? null)}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Trend</span>
                      <p className="mt-1 text-sm font-semibold text-white">{formatNumber(item.trend_score ?? null)}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-[#0d1b3a]/60 px-4 py-3 text-xs text-slate-200">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">NSRI Score</p>
                    <p className="mt-2 text-xs text-slate-300">{nsriLegend(nsri.parameters)}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-200">{nsri.risk_band}</p>
                    <p className="mt-1 text-xs text-slate-300">{nsri.indicates}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{item._live_source || "Live Ranking"}</span>
                    <span>{history.summary || ""}</span>
                    <span>Records {item.metadata?.record_count ?? item.cluster_size ?? "-"}</span>
                  </div>

                  {item.why_ranked ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-[#0d1b3a]/60 px-4 py-3 text-xs text-slate-200">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">NSRI Score</p>
                      <p className="mt-2 text-xs text-slate-300">{item.why_ranked}</p>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
