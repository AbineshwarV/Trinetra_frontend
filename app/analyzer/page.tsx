"use client";


import type { ChangeEvent, DragEvent, FormEvent } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, CloudUpload, Clock3, Eye, Globe, Layers, LockKeyhole, Loader2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { AnalyzerResultDashboard } from "@/components/analyzer-result-dashboard";
import { apiFetch } from "@/lib/api";

type AnalysisStage = "idle" | "preparing" | "queued" | "analyzing" | "finalizing" | "complete" | "error";

type BackendJobStatus = "queued" | "running" | "completed" | "failed";

interface JobResponse {
  job_id?: string;
  id?: string;
  jobId?: string;
  status?: BackendJobStatus | string;
  status_message?: string;
  progress_percent?: number;
  analysis_id?: string;
  error?: string;
}

const RUNNING_PROGRESS_CAP = 94;
const ACCENT_GRADIENT = "var(--app-shell-highlight-gradient)";
const ACCENT_SOFT = "var(--app-shell-highlight-soft)";
const STAGE_MILESTONES = [
  { name: "Extracting frames", progress: 20, icon: "ðŸŽžï¸" },
  { name: "Video analysis", progress: 35, icon: "ðŸ“¹" },
  { name: "Audio analysis", progress: 55, icon: "ðŸ”Š" },
  { name: "Text analysis", progress: 75, icon: "ðŸ“" },
  { name: "Final scoring", progress: 90, icon: "âœ…" },
] as const;

const getMilestoneStatus = (progress: number): string => {
  if (progress >= 90) return "Final scoring in progress...";
  if (progress >= 75) return "Text analysis in progress...";
  if (progress >= 55) return "Audio analysis in progress...";
  if (progress >= 35) return "Video analysis in progress...";
  if (progress >= 20) return "Extracting frames...";
  return "Preparing analysis...";
};

const ANALYSIS_STEPS: Array<{
  key: AnalysisStage;
  title: string;
  description: string;
  icon: any;
}> = [
  {
    key: "preparing",
    title: "Preparing input",
    description: "Validating media and creating your analysis request.",
    icon: Clock3,
  },
  {
    key: "queued",
    title: "Queued for scan",
    description: "Your request has been accepted and queued by the analyzer.",
    icon: Layers,
  },
  {
    key: "analyzing",
    title: "Analyzing signals",
    description: "Checking video, audio, and text artifacts in real time.",
    icon: MessageCircle,
  },
  {
    key: "finalizing",
    title: "Fusing verdict",
    description: "Combining model outputs into a trusted risk score.",
    icon: ShieldCheck,
  },
];

const PROGRESS_ITEMS = [
  { label: "Hashing media stream", detail: "Analyze file integrity and frame signatures." },
  { label: "Spatial forensics Â· GAN signature", detail: "Detect manipulated pixels and texture artifacts." },
  { label: "Temporal coherence Â· frame analysis", detail: "Check motion consistency across frames." },
  { label: "Acoustic fingerprint Â· voice clone check", detail: "Verify audio authenticity and speaker traces." },
  { label: "Fusing trinity verdict", detail: "Combine video, audio, and text evidence." },
];

const getProgressPercent = (stage: AnalysisStage) => {
  switch (stage) {
    case "preparing":
      return 10;
    case "queued":
      return 25;
    case "analyzing":
      return 50;
    case "finalizing":
      return 85;
    case "complete":
      return 100;
    case "error":
      return 100;
    default:
      return 0;
  }
};

const getStageLabel = (stage: AnalysisStage) => {
  switch (stage) {
    case "preparing":
      return "Initializing analysis";
    case "queued":
      return "Queued for scan";
    case "analyzing":
      return "Scanning signals";
    case "finalizing":
      return "Fusing final verdict";
    case "complete":
      return "Analysis complete";
    case "error":
      return "Analysis failed";
    default:
      return "Ready to analyze";
  }
};

function normalizeDashboardResult(payload: any) {
  const db = payload?.db ?? {};
  const record = payload?.record ?? payload?.result ?? payload ?? {};
  const nestedResult = record?.result ?? {};
  const merged = { ...db, ...record, analysis_id: db?.analysis_id ?? record?.analysis_id };

  return {
    result: merged,
    summary: record?.summary ?? nestedResult?.summary ?? {},
    timing: record?.timing ?? nestedResult?.timing ?? null,
  };
}

export default function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [existingPublic, setExistingPublic] = useState<{ analysis_id: string; created_at?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jobEventsRef = useRef<EventSource | null>(null);
  const backendStatusRef = useRef<string>("");



  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setInput(""); // Clear text input if file selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle file drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };


  // Handle text/URL input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value !== "") {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // When text field is focused, clear file
  const handleInputFocus = () => {
    if (file) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle file select button
  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  // Handle analyze button click

  const mapBackendStatus = (status: string | undefined, progress?: number): AnalysisStage => {
    const normalized = String(status ?? "").toLowerCase();
    if (normalized === "queued") return "queued";
    if (normalized === "running") {
      if (typeof progress === "number" && progress >= 80) return "finalizing";
      return "analyzing";
    }
    if (normalized === "completed" || normalized === "done") return "complete";
    if (normalized === "failed" || normalized === "error") return "error";
    return "preparing";
  };

  const closeJobEvents = () => {
    if (jobEventsRef.current) {
      jobEventsRef.current.close();
      jobEventsRef.current = null;
    }
  };

  const handleJobUpdate = async (job: JobResponse) => {
    backendStatusRef.current = String(job.status ?? "").toLowerCase();
    const nextStage = mapBackendStatus(job.status, job.progress_percent);
    setStage(nextStage);
    setStatusMessage(job.status_message ?? null);
    if (typeof job.progress_percent === "number") {
      const nextValue =
        backendStatusRef.current === "running"
          ? Math.max(progressPercent, Math.min(job.progress_percent, RUNNING_PROGRESS_CAP))
          : job.progress_percent;
      setProgressPercent(nextValue);
    } else {
      setProgressPercent(getProgressPercent(nextStage));
    }

    if (job.status === "completed" || job.status === "done") {
      closeJobEvents();
      if (job.analysis_id) {
        const resultResponse = await apiFetch(`/api/analysis-results/${encodeURIComponent(job.analysis_id)}`, { cache: "no-store" });
        if (!resultResponse.ok) {
          throw new Error("Failed to load final analysis result.");
        }
        const analysisResult = await resultResponse.json();
        setResult(analysisResult);
      } else {
        setResult(job);
      }
      setStage("complete");
      window.dispatchEvent(new Event("recents:update"));
      return;
    }

    if (job.status === "failed" || job.status === "error") {
      closeJobEvents();
      throw new Error(job?.error || "Analysis failed.");
    }
  };

  const subscribeToJobStatus = (nextJobId: string) =>
    new Promise<void>((resolve, reject) => {
      closeJobEvents();
      const source = new EventSource(`/api/jobs/${encodeURIComponent(nextJobId)}/events`);
      jobEventsRef.current = source;
      let settled = false;

      source.addEventListener("status", (event) => {
        const message = event as MessageEvent<string>;
        void (async () => {
          try {
            const job = JSON.parse(message.data) as JobResponse;
            await handleJobUpdate(job);
            const normalized = String(job.status ?? "").toLowerCase();
            if (normalized === "completed" || normalized === "done") {
              settled = true;
              resolve();
            } else if (normalized === "failed" || normalized === "error") {
              settled = true;
              reject(new Error(job.error || "Analysis failed."));
            }
          } catch (err) {
            settled = true;
            reject(err instanceof Error ? err : new Error("Failed to process job stream."));
          }
        })();
      });

      source.addEventListener("error", () => {
        if (settled) {
          closeJobEvents();
          return;
        }

        closeJobEvents();
        void (async () => {
          try {
            const statusResponse = await apiFetch(`/api/jobs/${encodeURIComponent(nextJobId)}`, { cache: "no-store" });
            if (!statusResponse.ok) {
              throw new Error("Real-time status stream disconnected.");
            }

            const job: JobResponse = await statusResponse.json();
            await handleJobUpdate(job);
            const normalized = String(job.status ?? "").toLowerCase();
            if (normalized === "completed" || normalized === "done") {
              settled = true;
              resolve();
              return;
            }
            if (normalized === "failed" || normalized === "error") {
              settled = true;
              reject(new Error(job.error || "Analysis failed."));
              return;
            }

            // Non-terminal state: resume real-time stream without failing the UI.
            await subscribeToJobStatus(nextJobId);
            settled = true;
            resolve();
          } catch (err) {
            settled = true;
            reject(err instanceof Error ? err : new Error("Real-time status stream disconnected."));
          }
        })();
      });
    });

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    closeJobEvents();
    setLoading(true);
    setResult(null);
    setError(null);
    setStage("preparing");
    setJobId(null);
    setStatusMessage(null);
    setProgressPercent(0);
    backendStatusRef.current = "";

    try {
      let uploadId = "";

      if (file) {
        const formData = new FormData();
        formData.append("files", file);
        const uploadResponse = await apiFetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed.");
        }

        const uploads = await uploadResponse.json();
        uploadId = uploads?.[0]?.id;
      } else if (input.trim()) {
        const trimmedInput = input.trim();
        const inputResponse = await apiFetch("/api/inputs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kind: /^https?:\/\//i.test(trimmedInput) ? "link" : "text",
            content: trimmedInput,
          }),
        });

        if (!inputResponse.ok) {
          throw new Error("Input submission failed.");
        }

        const upload = await inputResponse.json();
        uploadId = upload?.id;
      } else {
        setLoading(false);
        setStage("idle");
        return;
      }

      if (!uploadId) {
        throw new Error("Upload ID missing.");
      }

      setStage("queued");
      const asyncResponse = await apiFetch(`/api/analyze/${uploadId}/async`, {
        method: "POST",
      });

      if (asyncResponse.ok) {
        const payload: JobResponse = await asyncResponse.json();
        const newJobId = payload?.job_id || payload?.id || payload?.jobId || null;
        if (!newJobId) {
          throw new Error("Missing async job id.");
        }

        setJobId(newJobId);
        setStatusMessage(payload.status_message ?? null);
        setProgressPercent(typeof payload.progress_percent === "number" ? payload.progress_percent : getProgressPercent(mapBackendStatus(payload.status, payload.progress_percent)));
        setStage(mapBackendStatus(payload.status, payload.progress_percent));

        await subscribeToJobStatus(newJobId);
        return;
      }

      setStage("analyzing");
      const res = await apiFetch(`/api/analyze/${uploadId}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Analysis failed.");
      }

      const data = await res.json();
      setResult(data);
      setStage("complete");
      setProgressPercent(100);
      window.dispatchEvent(new Event("recents:update"));
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Failed to analyze input.");
    } finally {
      setLoading(false);
    }
  };

  const dashboard = normalizeDashboardResult(result);
  const visualStage: AnalysisStage = stage === "analyzing" && progressPercent >= 80 ? "finalizing" : stage;
  const computedStatusMessage = stage === "error"
    ? (statusMessage || "Analysis failed.")
    : stage === "complete"
    ? "Analysis completed successfully."
    : getMilestoneStatus(progressPercent);

  useEffect(() => {
    if (!jobId) return;
    if (stage === "complete" || stage === "error") return;
    if (backendStatusRef.current !== "running") return;

    const timer = setInterval(() => {
      setProgressPercent((current) => {
        if (current >= RUNNING_PROGRESS_CAP) return current;
        const increment = current < 35 ? 3 : current < 70 ? 2 : 1;
        return Math.min(current + increment, RUNNING_PROGRESS_CAP);
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [jobId, stage]);

  useEffect(() => {
    return () => {
      closeJobEvents();
    };
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex w-full flex-col gap-6">
        {existingPublic ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
            <div className="relative w-full max-w-md rounded-2xl border border-indigo-300/20 bg-[#0b1426] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.55)]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-indigo-300/40 text-indigo-100 shadow-[0_0_20px_rgba(91,74,230,0.35)]"
                  style={{ backgroundImage: ACCENT_GRADIENT }}
                >
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Public analysis already exists</h3>
                  <p className="mt-2 text-xs text-slate-300">
                    This URL has already been analyzed and the results are available under public visibility.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-semibold text-indigo-200">
                    #
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400">Analysis ID</div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {existingPublic.analysis_id}
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-4 flex items-center gap-3 text-slate-500">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xl">✦</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white"
                  onClick={() => setExistingPublic(null)}
                >
                  ✕
                  Cancel
                </button>
                <Link
                  href={`/analyzer/results/${encodeURIComponent(existingPublic.analysis_id)}?source=public`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-300/18 px-5 py-2 text-sm font-semibold text-white"
                  style={{ backgroundImage: ACCENT_GRADIENT }}
                  onClick={() => setExistingPublic(null)}
                >
                  👁
                  See result
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
                <LockKeyhole className="h-4 w-4" />
                Only you can see this analysis.
              </div>
            </div>
          </div>
        ) : null}
        {/* Main Card: Input, Progress, or Result */}
        {!result && (
        <section className="rounded-[1.75rem] border border-(--app-shell-card-border) bg-[rgba(10,20,42,0.62)] p-5 shadow-[0_18px_44px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-6 lg:p-8">
          {/* Show input if idle and no result */}
          {stage === "idle" && !result && (
            <form onSubmit={handleAnalyze}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">Upload media</h2>
                    <p className="mt-2 text-sm text-slate-400">Drag and drop, or select a file to begin the review.</p>
                  </div>
                  <div
                    className="hidden rounded-full border border-sky-300/16 px-3 py-1 text-xs text-slate-200 sm:block"
                    style={{ backgroundImage: ACCENT_SOFT }}
                  >
                    Supports video, audio, and text
                  </div>
                </div>
              <div
                className="mt-6 rounded-[1.5rem] border border-dashed border-cyan-300/20 bg-[linear-gradient(180deg,rgba(11,22,46,0.38),rgba(8,17,36,0.28))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm sm:p-8"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => {
                  if (file || input.trim()) return;
                  handleSelectFiles();
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload a file"
                style={{ cursor: "pointer" }}
              >
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-300/18 text-cyan-100 shadow-[0_14px_32px_rgba(47,111,203,0.14)]"
                  style={{ backgroundImage: "var(--app-shell-highlight-soft)" }}
                >
                  <CloudUpload className="h-8 w-8" />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-white sm:text-xl">Drop files here or click to upload</p>
                  <p className="mt-2 text-sm text-slate-400">Recommended for clips under 5 minutes and files up to 100MB.</p>
                </div>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,audio/*,text/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!!input}
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectFiles();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-300/16 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:brightness-110 disabled:opacity-60"
                    style={{ backgroundImage: "var(--app-shell-highlight-soft)" }}
                    disabled={!!input}
                  >
                    Select files
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {file ? (
                    <div
                      className="flex flex-wrap items-center justify-center gap-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-slate-300 underline underline-offset-2 hover:text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs uppercase tracking-widest text-slate-400">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                {/* URL / Text Input */}
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    placeholder="Paste a URL or enter text..."
                    className="w-full rounded-xl border border-cyan-300/35 bg-[rgba(4,10,24,0.46)] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-300/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-xl border border-sky-300/18 px-6 py-3 text-sm font-semibold text-white backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:brightness-110 hover:shadow-[0_0_22px_rgba(47,111,203,0.22)] disabled:opacity-60"
                style={{ backgroundImage: ACCENT_GRADIENT }}
                disabled={loading || (!file && !input.trim())}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    Analyze
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
              {error ? (
                <div className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
            </form>
          )}

          {stage === "idle" && !result ? (
            <div className="rounded-2xl border border-indigo-300/25 bg-slate-800/40 p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-300/30 bg-indigo-400/10">
                  <Eye className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Visibility</p>
                  <p className="text-sm text-slate-400">Choose who can view this analysis result.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition ${
                    visibility === "private"
                      ? "border-indigo-400/50 bg-slate-900/50"
                      : "border-slate-700/50 bg-slate-900/20 hover:border-slate-600/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${visibility === "private" ? "border-indigo-400 bg-indigo-400/20" : "border-slate-600"}`}>
                      {visibility === "private" && <div className="h-2 w-2 rounded-full bg-indigo-300" />}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800/50">
                      <LockKeyhole className="h-5 w-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Private</p>
                      <p className="text-xs text-slate-400">Only you can view this analysis.</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition ${
                    visibility === "public"
                      ? "border-indigo-400/50 bg-slate-900/50"
                      : "border-slate-700/50 bg-slate-900/20 hover:border-slate-600/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${visibility === "public" ? "border-indigo-400 bg-indigo-400/20" : "border-slate-600"}`}>
                      {visibility === "public" && <div className="h-2 w-2 rounded-full bg-indigo-300" />}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-400/15">
                      <Globe className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">Public</p>
                        <span className="rounded-full bg-indigo-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-100">Recommended</span>
                      </div>
                      <p className="text-xs text-slate-400">Make this analysis result visible to all users.</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <p className="text-xs text-emerald-100">Once set to public, anyone with the link can view the analysis result.</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Simple loader while processing */}
          {stage !== "idle" && !result && (
            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-(--app-shell-border) bg-(--app-shell-panel) px-6 py-10 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-200" />
              <h2 className="mt-4 text-xl font-semibold text-white">
                {stage === "error" ? "Analysis Failed" : "Processing..."}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {stage === "error"
                  ? (statusMessage || "Something went wrong during analysis.")
                  : (statusMessage || "Please wait while we process your input.")}
              </p>
              <p className="mt-1 text-xs text-slate-400">{file?.name || "Your media"}</p>
              <button
                onClick={() => {
                  setStage("idle");
                  setResult(null);
                  setJobId(null);
                  setProgressPercent(0);
                  setStatusMessage(null);
                  backendStatusRef.current = "";
                  closeJobEvents();
                }}
                className="mt-6 rounded-lg border border-(--app-shell-border) bg-(--app-shell-panel) px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-(--app-shell-panel-2)"
              >
                Reset
              </button>
            </div>
          )}

        </section>
        )}

        {result && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  setStage("idle");
                  setResult(null);
                  setJobId(null);
                  setProgressPercent(0);
                  setStatusMessage(null);
                  backendStatusRef.current = "";
                  closeJobEvents();
                }}
                className="rounded-lg border border-(--app-shell-border) bg-(--app-shell-panel) px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-(--app-shell-panel-2)"
              >
                Reset
              </button>
            </div>
            <AnalyzerResultDashboard
              result={dashboard.result}
              summary={dashboard.summary}
              timing={dashboard.timing}
            />
          </div>
        )}

        <div className="rounded-[1.75rem] border border-(--app-shell-card-border) bg-(--app-shell-panel) px-5 py-4 text-sm text-slate-400 shadow-(--app-shell-shadow) sm:px-6">
          Recommended Video duration should be less than 5 minutes. Maximum file size: 100MB.
        </div>
      </div>
    </div>
  );
}

