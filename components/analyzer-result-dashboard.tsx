"use client";

import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from "recharts";
import {
  Clock3,
  FileText,
  FileSearch,
  Link2,
  ShieldAlert,
  ShieldCheck,
  Video,
  Volume2,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

type Accent = {
  border: string;
  panel: string;
  icon: string;
  bar: string;
  glow: string;
};

const accents = {
  video: {
    border: "border-sky-300/18",
    panel: "bg-sky-400/[0.045]",
    icon: "border-sky-300/20 bg-sky-400/10 text-sky-200",
    bar: "from-sky-400 to-cyan-300",
    glow: "shadow-[inset_0_0_42px_rgba(56,189,248,0.08)]",
  },
  audio: {
    border: "border-violet-300/18",
    panel: "bg-violet-400/[0.055]",
    icon: "border-violet-300/20 bg-violet-400/10 text-violet-200",
    bar: "from-violet-400 to-fuchsia-300",
    glow: "shadow-[inset_0_0_42px_rgba(139,92,246,0.1)]",
  },
  text: {
    border: "border-amber-300/18",
    panel: "bg-amber-400/[0.05]",
    icon: "border-amber-300/20 bg-amber-400/10 text-amber-200",
    bar: "from-amber-300 to-yellow-200",
    glow: "shadow-[inset_0_0_42px_rgba(251,191,36,0.08)]",
  },
  timing: {
    border: "border-emerald-300/18",
    panel: "bg-emerald-400/[0.045]",
    icon: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
    bar: "from-emerald-400 to-lime-300",
    glow: "shadow-[inset_0_0_42px_rgba(16,185,129,0.08)]",
  },
};

function numberValue(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function displayValue(value: unknown) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function compactId(value: unknown) {
  const text = displayValue(value);
  if (text === "-" || text.length <= 28) return text;
  return `${text.slice(0, 12)}...${text.slice(-10)}`;
}

function formatPercent(value: unknown) {
  const n = numberValue(value);
  if (n === null) return "-";
  const unit = n > 1 ? n : n * 100;
  return `${Math.round(unit)}%`;
}

function formatSeconds(value: unknown) {
  const n = numberValue(value);
  if (n === null) return "-";
  const seconds = n > 1000 ? n / 1000 : n;
  return `${seconds.toFixed(2)}s`;
}

function formatScoreNumber(value: unknown) {
  const n = numberValue(value);
  if (n === null) return "-";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function statusLabel(value: unknown) {
  return displayValue(value);
}

function firstPresent(...values: unknown[]) {
  return values.find((value) => value !== null && value !== undefined && value !== "");
}

function riskVerdict(value: unknown) {
  const raw = displayValue(value).trim().toLowerCase();
  if (!raw || raw === "-") return null;
  if (raw.includes("low")) return { level: "LOW RISK" as const, tone: "safe" as const };
  if (raw.includes("high")) return { level: "HIGH RISK" as const, tone: "unsafe" as const };
  return null;
}

function percentNumber(value: unknown) {
  const n = numberValue(value);
  if (n === null) return null;
  return Math.round(n > 1 ? n : n * 100);
}

function kpiMetric(value: unknown, suffix = "") {
  const rendered = suffix === "%" ? formatPercent(value) : formatScoreNumber(value);
  return rendered === "-" ? null : rendered;
}

function Field({ label, value, badge }: { label: string; value: unknown; badge?: boolean }) {
  const rendered = displayValue(value);
  return (
    <div className="flex min-h-8 items-center justify-between gap-4 border-b border-white/[0.07] py-2 last:border-b-0">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <span
        className={
          badge
            ? "max-w-[58%] truncate rounded-md bg-emerald-400/12 px-2 py-1 text-[11px] font-semibold text-emerald-200"
            : "max-w-[58%] truncate text-right text-xs font-semibold text-slate-50"
        }
        title={rendered}
      >
        {rendered}
      </span>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  Icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  Icon: ComponentType<{ className?: string }>;
  accent: Accent;
}) {
  return (
    <section
      className={`min-h-36 rounded-lg border bg-(--app-shell-card) p-4 shadow-(--app-shell-shadow) sm:p-5 xl:min-h-49 ${accent.border} ${accent.panel} ${accent.glow}`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${accent.icon}`}>
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
      <p className="mt-5 text-3xl font-bold leading-none text-white">{value}</p>
      <p className="mt-4 text-sm text-slate-400">{subtitle}</p>
    </section>
  );
}

function AnalysisCard({
  title,
  Icon,
  accent,
  progress,
  segments,
  children,
}: {
  title: string;
  Icon: ComponentType<{ className?: string }>;
  accent: Accent;
  progress: number;
  segments?: Array<{ percent: number; className: string }>;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-lg border bg-(--app-shell-card) p-4 shadow-(--app-shell-shadow) ${accent.border} ${accent.panel} ${accent.glow}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${accent.icon}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <h3 className="truncate text-sm font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="mt-4">{children}</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        {segments && segments.length ? (
          <div className="flex h-full w-full">
            {segments.map((segment, index) => (
              <div
                key={index}
                className={`h-full ${segment.className}`}
                style={{ width: `${Math.min(Math.max(segment.percent, 0), 100)}%` }}
              />
            ))}
          </div>
        ) : (
          <div className={`h-full rounded-full bg-linear-to-r ${accent.bar}`} style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
        )}
      </div>
    </section>
  );
}

function ScoreRing({ score, label }: { score: number | null; label: string }) {
  const clamped = Math.min(Math.max(score ?? 0, 0), 100);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const verdict = riskVerdict(label);
  const displayLabel = verdict ? verdict.level : label === "-" ? "-" : label.toUpperCase();
  const verdictBadge =
    verdict
      ? {
        className:
          verdict.tone === "safe"
            ? "inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/12 px-3 py-1.5 text-sm font-semibold text-emerald-200"
            : "inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/12 px-3 py-1.5 text-sm font-semibold text-rose-200",
        Icon: verdict.tone === "safe" ? ShieldCheck : ShieldAlert,
        label: verdict.level,
      }
      : null;

  return (
    <div className="grid place-items-center gap-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <div className="relative mx-auto h-24 w-24 sm:mx-0 sm:h-23 sm:w-23">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#38bdf8" />
              <stop offset="0.55" stopColor="#6366f1" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex min-w-0 flex-col items-center justify-center text-center">
        {verdictBadge ? (
          <span className={verdictBadge.className}>
            <verdictBadge.Icon className="h-4 w-4" />
            {verdictBadge.label}
          </span>
        ) : null}
        <p className="mt-3 inline-flex items-baseline justify-center whitespace-nowrap font-bold tabular-nums leading-none tracking-normal text-white">
          <span className="text-[1.75rem] sm:text-[1.9rem] lg:text-[2.05rem]">{formatScoreNumber(score)}</span>
          <span className="mx-2 text-[1.15rem] font-semibold text-slate-300/85 sm:text-[1.2rem] lg:text-[1.25rem]">/</span>
          <span className="relative top-[0.12em] text-[1.25rem] font-semibold text-slate-300/75 sm:text-[1.35rem] lg:text-[1.4rem]">100</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {verdict ? null : (
            <p className="max-w-[16rem] text-balance text-lg font-bold leading-snug text-white sm:text-xl">{displayLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

type ConfidencePoint = {
  label: string;
  value: number | null;
};

type ConfidenceDotProps = {
  cx?: number;
  cy?: number;
  payload?: { label?: string; value?: number };
  selectedLabel: string | null;
  onSelect: (label: string) => void;
};

function ConfidenceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string | null }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const entry = payload.find((item) => item.value !== undefined && item.value !== null);
  if (!entry) return null;

  return (
    <div className="rounded-lg border border-sky-400/60 bg-transparent px-3 py-2 backdrop-blur-md shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-semibold text-sky-300">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{entry.value}%</p>
    </div>
  );
}

function ConfidenceDot({ cx, cy, payload, selectedLabel, onSelect }: ConfidenceDotProps) {
  if (cx === undefined || cy === undefined || !payload?.label || payload.value === undefined) return null;

  const isSelected = payload.label === selectedLabel;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 7 : 5}
      fill={isSelected ? "#f59e0b" : "#0f172a"}
      stroke={isSelected ? "#fde68a" : "#a78bfa"}
      strokeWidth={isSelected ? 3 : 2}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect(payload.label!)}
    />
  );
}

function ConfidenceChart({ data }: { data: ConfidencePoint[] }) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  // Prepare data for recharts: nulls become undefined for gaps
  const chartData = data.map((item) => ({
    label: item.label,
    value: typeof item.value === "number" ? Math.max(0, Math.min(100, item.value)) : undefined,
  }));
  return (
    <section className="rounded-lg border border-white/10 bg-[rgba(10,20,42,0.46)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
      <h3 className="text-sm font-bold text-white">Confidence Over Time</h3>
      <div className="mt-4 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.32} />
                <stop offset="60%" stopColor="#8b5cf6" stopOpacity={0.10} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="confidenceLine" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#38bdf8" />
                <stop offset="0.52" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
            <XAxis dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              cursor={{ stroke: "rgba(56,189,248,0.28)", strokeWidth: 1 }}
              content={<ConfidenceTooltip />}
              filterNull
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#confidenceArea)"
              isAnimationActive={true}
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#confidenceLine)"
              strokeWidth={3}
              dot={(props) => <ConfidenceDot {...props} selectedLabel={selectedLabel} onSelect={setSelectedLabel} />}
              activeDot={{
                r: 7,
                fill: '#38bdf8',
                stroke: '#fff',
                strokeWidth: 2,
              }}
              isAnimationActive={true}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ActionButton({
  Icon,
  title,
  subtitle,
  onClick,
  disabled,
  compact,
}: {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        compact
          ? "flex w-full items-center gap-3 rounded-lg border border-white/6 bg-white/4.5 p-2 text-left transition hover:border-sky-300/25 hover:bg-sky-300/8 disabled:cursor-not-allowed disabled:opacity-55"
          : "flex w-full items-center gap-3 rounded-lg border border-white/6 bg-white/4.5 p-3 text-left transition hover:border-sky-300/25 hover:bg-sky-300/8 disabled:cursor-not-allowed disabled:opacity-55"
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-300/14 bg-sky-400/10 text-sky-100">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-white">{title}</span>
        <span className="block truncate text-xs text-slate-400">{subtitle}</span>
      </span>
    </button>
  );
}

export function AnalyzerResultDashboard({
  result,
  summary,
  timing,
}: {
  result: any;
  summary: any;
  timing: any;
}) {
  const resultId = result?.analysis_id ?? result?.analysisId ?? result?.id ?? null;
  const initialReportUrl =
    result?.detailed_report_path && resultId ? `/api/results/${encodeURIComponent(resultId)}/report/view` : null;
  const [reportUrl, setReportUrl] = useState<string | null>(initialReportUrl);
  const [reportStatus, setReportStatus] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const overallRaw = numberValue(summary?.overall_score ?? summary?.final_score_out_of_100 ?? summary?.final_score);
  const overallScore = overallRaw === null ? null : overallRaw <= 1 ? overallRaw * 100 : overallRaw;
  const verdict = displayValue(summary?.overall_verdict);
  const videoTimeMs = numberValue(timing?.video_time_ms ?? timing?.video_time ?? timing?.video);
  const audioTimeMs = numberValue(timing?.audio_time_ms ?? timing?.audio_time ?? timing?.audio);
  const textTimeMs = numberValue(timing?.text_time_ms ?? timing?.text_time ?? timing?.text);
  const totalTimeMs =
    numberValue(timing?.total_time_ms ?? timing?.total_time ?? timing?.total) ??
    [videoTimeMs, audioTimeMs, textTimeMs].reduce((acc, item) => (acc ?? 0) + (item ?? 0), 0);
  const totalTime = formatSeconds(timing?.total_time_ms ?? timing?.total_time ?? timing?.total);
  const createdAt = displayValue(result?.created_at ?? result?.timestamp);
  const title = displayValue(result?.filename ?? result?.input_name ?? result?.input_file ?? result?.id ?? "Result");
  const status = displayValue(result?.overall_status ?? summary?.overall_status ?? result?.status).toUpperCase();
  const statusTone = status.includes("FAIL") || status.includes("ERROR") ? "text-rose-200 bg-rose-500/12" : "text-emerald-200 bg-emerald-500/12";
  const audioResult = firstPresent(
    summary?.audio,
    summary?.audio_result,
    summary?.audio_analysis,
    result?.audio,
    result?.audio_result,
    result?.audio_analysis,
    result?.result?.audio,
    result?.result?.audio_result,
  ) as any;
  const textResult = firstPresent(
    summary?.text_result,
    summary?.text_analysis,
    summary?.complete_result,
    result?.text_result,
    result?.text_analysis,
    result?.complete_result,
    result?.result?.text_result,
    summary?.text,
    result?.result?.text,
    result?.text,
  ) as any;
  const audioClassification = displayValue(firstPresent(
    summary?.audio_classification,
    summary?.audio_prediction,
    result?.audio?.audio_prediction,
    result?.audio?.prediction,
    result?.audio?.classification,
    audioResult?.classification,
    audioResult?.prediction,
    audioResult?.result?.prediction,
    audioResult?.result?.model_prediction,
    audioResult?.model_prediction,
  )).toUpperCase();
  const videoClassification = firstPresent(summary?.video_classification, result?.video?.classification, result?.video_result?.json_report?.final_result?.classification);
  const videoFakeRaw = firstPresent(summary?.video_deepfake_probability, summary?.video_ai_score, result?.video?.fake_probability);
  const videoRealRaw = firstPresent(summary?.video_real_probability, result?.video?.real_probability);
  const audioDeepfakeRaw = firstPresent(
    summary?.audio_deepfake_probability,
    result?.audio?.audio_deepfake_probability,
    audioResult?.audio_deepfake_probability,
    audioResult?.deepfake_probability,
    audioResult?.result?.probabilities?.Deepfake,
  );
  const audioRealRaw = firstPresent(
    summary?.audio_real_probability,
    result?.audio?.audio_real_probability,
    audioResult?.audio_real_probability,
    audioResult?.real_probability,
    audioResult?.result?.probabilities?.Real,
  );
  const audioDeepfake = formatPercent(audioDeepfakeRaw);
  const audioReal = formatPercent(audioRealRaw);
  const textAiLabel = firstPresent(summary?.ai_label, textResult?.ai_label, textResult?.AI, textResult?.user_output?.AI, textResult?.complete_result?.AI);
  const textFactLabel = firstPresent(summary?.fact_label, textResult?.fact_label, textResult?.FACT, textResult?.user_output?.FACT, textResult?.complete_result?.FACT);
  const textAiScore = firstPresent(
    summary?.metrics?.ai_score,
    summary?.ai_score,
    summary?.text_ai_score,
    summary?.text?.ai_score,
    textResult?.metrics?.ai_score,
    textResult?.ai_score,
    textResult?.analysis?.metrics?.ai_score,
    textResult?.complete_result?.metrics?.ai_score,
    result?.metrics?.ai_score,
    result?.summary?.metrics?.ai_score,
    result?.summary?.ai_score,
    result?.summary?.text_ai_score,
    result?.result?.metrics?.ai_score,
    result?.result?.text_result?.analysis?.metrics?.ai_score,
    result?.record?.metrics?.ai_score,
    result?.text_engine?.metrics?.ai_score,
    result?.text?.metrics?.ai_score,
    result?.text?.ai_score,
  );
  const textFinalScore = firstPresent(summary?.final_score_out_of_100, summary?.final_score, textResult?.final_score_out_of_100, textResult?.complete_result?.final_score_out_of_100, textResult?.final_score);
  const videoStatus = firstPresent(summary?.video_status, result?.video?.status, result?.summary?.video_status);
  const audioStatus = firstPresent(summary?.audio_status, result?.audio?.status, result?.summary?.audio_status);
  const textStatus = firstPresent(summary?.text_status, result?.text?.status, result?.summary?.text_status);
  const videoFakeNum = percentNumber(videoFakeRaw);
  const videoRealNum = percentNumber(videoRealRaw);
  const videoIsDeepfake = (videoFakeNum ?? -1) >= (videoRealNum ?? -1);
  const videoDominantRaw = videoIsDeepfake ? videoFakeRaw : videoRealRaw;
  const videoKpiValue = kpiMetric(videoDominantRaw, "%") ?? statusLabel(videoStatus);
  const videoKpiSubtitle = kpiMetric(videoDominantRaw, "%") ? (videoIsDeepfake ? "Deepfake Probability" : "Real Probability") : "Status";
  const audioFakeNum = percentNumber(audioDeepfakeRaw);
  const audioRealNum = percentNumber(audioRealRaw);
  const audioIsDeepfake = (audioFakeNum ?? -1) >= (audioRealNum ?? -1);
  const audioDominantRaw = audioIsDeepfake ? audioDeepfakeRaw : audioRealRaw;
  const audioKpiValue = kpiMetric(audioDominantRaw, "%") ?? statusLabel(audioStatus);
  const audioKpiSubtitle = kpiMetric(audioDominantRaw, "%") ? (audioIsDeepfake ? "Deepfake Probability" : "Real Probability") : "Status";
  const textKpiValue = kpiMetric(textAiScore) ?? statusLabel(textStatus);
  const textKpiSubtitle = kpiMetric(textAiScore) ? "Ai Score" : "Status";
  const videoProgress = percentNumber(videoFakeRaw) ?? 0;
  const audioProgress = percentNumber(audioDeepfakeRaw) ?? 0;
  const hasSplitTiming = (videoTimeMs ?? 0) > 0 || (audioTimeMs ?? 0) > 0 || (textTimeMs ?? 0) > 0;
  const textProgress = numberValue(textAiScore) ?? 0;
  const chartData = [
    { label: "Start", value: 0 },
    { label: "Video", value: percentNumber(videoRealRaw) },
    { label: "Audio", value: percentNumber(audioRealRaw) },
    { label: "Text", value: numberValue(textAiScore) },
    { label: "Complete", value: overallScore },
  ];

  async function handleReportView() {
    if (!resultId) {
      setReportStatus("Report view is unavailable for this result.");
      return;
    }
    const newTab = window.open("", "_blank");

    if (!newTab) {
      setReportStatus("Popup blocked. Please allow popups.");
      return;
    }

    // Avoid a blank new tab while the backend generates the PDF.
    try {
      newTab.document.open();
      newTab.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Trinetra - Report</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        background: linear-gradient(180deg, #020817 0%, #030b1e 100%);
        color: #e5e7eb;
      }
      .wrap { min-height: 100vh; display: grid; place-items: center; padding: 28px; }
      .card { width: min(520px, 100%); border-radius: 18px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); padding: 22px 20px; box-shadow: 0 24px 64px rgba(0,0,0,.38); backdrop-filter: blur(14px); }
      .brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 14px; }
      .logo {
        width: 52px; height: 52px; border-radius: 16px;
        display: grid; place-items: center;
        border: 1px solid rgba(255,210,48,.35);
        background: rgba(16,27,63,.85);
        color: #ffd230;
        font-weight: 900;
        letter-spacing: .02em;
        font-size: 22px;
      }
      .name { font-size: 14px; font-weight: 900; letter-spacing: .18em; color: rgba(255,255,255,.88); }
      h1 { margin: 0; font-size: 18px; letter-spacing: .01em; text-align: center; }
      p { margin: 10px 0 0; font-size: 13px; color: rgba(229,231,235,.72); line-height: 1.5; text-align: center; }
      .bar { margin-top: 14px; height: 6px; border-radius: 999px; background: rgba(255,255,255,.10); overflow: hidden; }
      .bar > i {
        display: block; height: 100%; width: 38%;
        background: linear-gradient(90deg, rgba(96,165,250,0), rgba(96,165,250,.90), rgba(96,165,250,0));
        animation: slide 1.2s ease-in-out infinite;
      }
      @keyframes slide { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="brand">
          <div class="logo" aria-hidden="true">T</div>
          <div class="name">TRINETRA</div>
        </div>
        <h1>Generating report…</h1>
        <p>This tab will open the PDF automatically when it’s ready.</p>
        <div class="bar" aria-hidden="true"><i></i></div>
      </div>
    </div>
  </body>
</html>`);
      newTab.document.close();
    } catch {
      // Ignore cross-browser write failures; we'll still navigate once ready.
    }

    const encodedId = encodeURIComponent(resultId);
    setIsGeneratingReport(true);
    setReportStatus(reportUrl ? "Opening report..." : "Preparing report view...");

    try {
      let nextReportUrl = reportUrl;
      if (!nextReportUrl) {
        const response = await apiFetch(`/api/results/${encodedId}/report`, { method: "POST" });
        if (!response.ok) {
          let message = "Report is unavailable for this archived result.";
          try {
            const payload = await response.json();
            message = typeof payload?.detail === "string" ? payload.detail : message;
          } catch {
            const text = await response.text();
            if (text) message = text;
          }
          throw new Error(message);
        }
        nextReportUrl = `/api/results/${encodedId}/report/view`;
        setReportUrl(nextReportUrl);
      }
      // Open a real app route so the tab URL/title aren't stuck at about:blank / "view".
      newTab.location.href = `/report?src=${encodeURIComponent(nextReportUrl)}`;
      setReportStatus("Opening report...");
    } catch (error) {
      setReportStatus(error instanceof Error ? error.message : "Failed to generate report.");
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <div className="w-full px-2 text-slate-100 sm:px-3 lg:px-4">
      <section className="rounded-[1.15rem] border border-white/10 bg-[rgba(10,20,42,0.62)] p-4 shadow-[0_18px_44px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-5 lg:p-6">
        <header className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-300/12 bg-sky-400/10 text-sky-200">
              <Link2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{title}</h2>
              <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">Scanned on {createdAt}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <span className={`rounded-full px-4 py-2 text-xs font-bold ${statusTone}`}>Overall: {status}</span>
            <span className="max-w-full truncate rounded-full bg-white/[0.07] px-4 py-2 text-xs font-bold text-slate-100">
              ID: {compactId(resultId)}
            </span>
          </div>
        </header>

        <section className="mt-4 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-[1.65fr_repeat(4,minmax(8.5rem,1fr))]">
          <div className="flex h-full min-h-36 flex-col rounded-lg border border-indigo-300/14 bg-(--app-shell-card) p-4 shadow-(--app-shell-shadow) sm:p-5 xl:min-h-49">
            <h3 className="mb-4 text-center text-sm font-bold text-white">Overall Score</h3>
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <ScoreRing score={overallScore} label={verdict} />
            </div>
          </div>
          <KpiCard title="Video" value={videoKpiValue} subtitle={videoKpiSubtitle} Icon={Video} accent={accents.video} />
          <KpiCard title="Audio" value={audioKpiValue} subtitle={audioKpiSubtitle} Icon={Volume2} accent={accents.audio} />
          <KpiCard title="Text" value={textKpiValue} subtitle={textKpiSubtitle} Icon={FileText} accent={accents.text} />
          <KpiCard title="Response Time" value={totalTime} subtitle="Total time" Icon={Clock3} accent={accents.timing} />
        </section>

        <section className="mt-5 rounded-[1rem] border border-white/10 bg-[rgba(10,20,42,0.50)] p-4 shadow-[0_18px_44px_rgba(2,8,23,0.22)] backdrop-blur-xl sm:p-5">
          <div>
            <h2 className="text-lg font-bold text-white">Analysis Results</h2>
            <p className="mt-1 text-sm text-slate-400">Detailed AI analysis across multiple modalities</p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <AnalysisCard
              title="Video Analysis"
              Icon={Video}
              accent={accents.video}
              progress={videoProgress}
            >
              <Field label="Classification" value={videoClassification} />
              <Field label="Deepfake Probability" value={formatPercent(videoFakeRaw)} />
              <Field label="Real Probability" value={formatPercent(videoRealRaw)} />
              <Field label="Status" value={statusLabel(videoStatus)} badge />
            </AnalysisCard>

            <AnalysisCard
              title="Audio Analysis"
              Icon={Volume2}
              accent={accents.audio}
              progress={audioProgress}
            >
              <Field label="Classification" value={audioClassification} />
              <Field label="Deepfake Probability" value={audioDeepfake} />
              <Field label="Real Probability" value={audioReal} />
              <Field label="Status" value={statusLabel(audioStatus)} badge />
            </AnalysisCard>

            <AnalysisCard
              title="Text Analysis"
              Icon={FileText}
              accent={accents.text}
              progress={textProgress}
            >
              <Field label="AI Label" value={textAiLabel} />
              <Field label="Ai Score" value={formatScoreNumber(textAiScore)} />
              <Field label="Fact Label" value={textFactLabel} />
              <Field label="Final Score" value={textFinalScore ?? "-"} />
            </AnalysisCard>

            <AnalysisCard
              title="Response Performance"
              Icon={Clock3}
              accent={accents.timing}
              progress={100}
              segments={
                totalTimeMs
                  ? [
                    { percent: ((videoTimeMs ?? 0) / totalTimeMs) * 100, className: "bg-emerald-400" },
                    { percent: ((audioTimeMs ?? 0) / totalTimeMs) * 100, className: "bg-teal-300" },
                    { percent: ((textTimeMs ?? 0) / totalTimeMs) * 100, className: "bg-lime-200" },
                  ]
                  : undefined
              }
            >
              <Field label="Video Time" value={formatSeconds(videoTimeMs)} />
              <Field label="Audio Time" value={formatSeconds(audioTimeMs)} />
              <Field label="Text Time" value={formatSeconds(textTimeMs)} />
              <Field label="Total Time" value={totalTime} />
              {!hasSplitTiming && totalTimeMs > 0 ? (
                <p className="text-[11px] text-amber-200/90">Per-engine split timing was not captured for this run.</p>
              ) : null}
            </AnalysisCard>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[2.35fr_0.85fr]">
            <ConfidenceChart data={chartData} />


            <section className="rounded-lg border border-white/10 bg-[rgba(10,20,42,0.46)] p-2.5 shadow-[0_18px_44px_rgba(2,8,23,0.18)] backdrop-blur-xl xl:sticky xl:top-6">
              <h3 className="text-sm font-bold text-white">Quick Actions</h3>
              <div className="mt-3 grid gap-2">
                <ActionButton
                  Icon={FileSearch}
                  title={isGeneratingReport ? "Preparing Report" : "View Report"}
                  subtitle="Open detailed analysis report"
                  onClick={handleReportView}
                  disabled={isGeneratingReport || !resultId}
                  compact
                />
              </div>
              {reportStatus ? <p className="mt-3 text-xs text-slate-400">{reportStatus}</p> : null}
            </section>
          </div>
        </section>
      </section>
    </div>
  );
}
