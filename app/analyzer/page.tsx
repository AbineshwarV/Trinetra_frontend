"use client";


import type { ChangeEvent, DragEvent, FormEvent } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, CloudUpload, Clock3, Eye, Globe, Layers, LockKeyhole, Loader2, MessageCircle, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { AnalyzerResultDashboard } from "@/components/analyzer-result-dashboard";
import { apiFetch } from "@/lib/api";

type AnalysisStage = "idle" | "preparing" | "queued" | "analyzing" | "finalizing" | "complete" | "error";

type BackendJobStatus = "queued" | "running" | "completed" | "failed";

type AgentState = "queued" | "running" | "completed";

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

interface AgentConfig {
  name: string;
  icon: string;
  messages: string[];
}

const AGENT_CONFIGS: Record<string, AgentConfig> = {
  audio: {
    name: "Audio Intelligence Agent",
    icon: "🎵",
    messages: [
      "Analyzing voice patterns...",
      "Extracting audio features...",
      "Detecting vocal inconsistencies...",
      "Running acoustic analysis...",
    ],
  },
  text: {
    name: "Text Intelligence Agent",
    icon: "📝",
    messages: [
      "Analyzing content...",
      "Extracting entities...",
      "Understanding sentiment...",
      "Generating insights...",
    ],
  },
  video: {
    name: "Video Intelligence Agent",
    icon: "🎬",
    messages: [
      "Analyzing visual content...",
      "Extracting key frames...",
      "Detecting patterns...",
      "Running AI inference...",
      "Generating insights...",
    ],
  },
};

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

const getTimelineDurations = () => [
  3000 + Math.floor(Math.random() * 300),
  5000 + Math.floor(Math.random() * 400),
  3000 + Math.floor(Math.random() * 300),
  3000 + Math.floor(Math.random() * 300),
];

const ANALYSIS_STEPS: Array<{
  key: AnalysisStage;
  title: string;
  description: string;
  icon: any;
}> = [
  {
    key: "preparing",
    title: "Preparing request",
    description: "Validating your submission and setting up processing.",
    icon: Clock3,
  },
  {
    key: "queued",
    title: "Queued for processing",
    description: "Your request is in line and will begin shortly.",
    icon: Layers,
  },
  {
    key: "analyzing",
    title: "Analyzing content",
    description: "Running the analysis pipeline in the background.",
    icon: MessageCircle,
  },
  {
    key: "finalizing",
    title: "Finalizing results",
    description: "Wrapping up the timeline and preparing output.",
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
  const [timelineStep, setTimelineStep] = useState(0);
  const [timelineDurations, setTimelineDurations] = useState<number[]>(getTimelineDurations());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [existingPublic, setExistingPublic] = useState<{ analysis_id: string; created_at?: string } | null>(null);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [pipelinePhase, setPipelinePhase] = useState<"audio" | "text" | "video" | "done">("audio");
  const [backendInputType, setBackendInputType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jobEventsRef = useRef<EventSource | null>(null);
  const backendStatusRef = useRef<string>("");
  const progressHistoryRef = useRef<Array<{ time: number; progress: number }>>([]);


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
      advancePipelinePhase(nextValue);

      // Calculate estimated time remaining
      if (backendStatusRef.current === "running" && analysisStartTime && nextValue > 0 && nextValue < 100) {
        const currentTime = Date.now();
        const elapsedMs = currentTime - analysisStartTime;
        const progressHistogram = progressHistoryRef.current;
        progressHistogram.push({ time: currentTime, progress: nextValue });

        // Keep only last 10 data points
        if (progressHistogram.length > 10) {
          progressHistogram.shift();
        }

        if (progressHistogram.length >= 2) {
          const first = progressHistogram[0];
          const last = progressHistogram[progressHistogram.length - 1];
          const timeDiff = last.time - first.time;
          const progressDiff = last.progress - first.progress;

          if (timeDiff > 0 && progressDiff > 0) {
            const ratePerMs = progressDiff / timeDiff;
            const remainingProgress = 100 - nextValue;
            const estimatedRemainingMs = Math.ceil(remainingProgress / ratePerMs);
            setEstimatedTimeRemaining(Math.max(0, estimatedRemainingMs));
          }
        }
      }
    } else {
      setProgressPercent(getProgressPercent(nextStage));
    }

    if (job.status === "completed" || job.status === "done") {
      // Stop listening for further SSE messages
      closeJobEvents();

      // Fetch the final analysis in the background but delay showing it
      // so the multi-agent pipeline can render the final "completed" state.
      let analysisResult: any = null;
      if (job.analysis_id) {
        const resultResponse = await apiFetch(`/api/analysis-results/${encodeURIComponent(job.analysis_id)}`, { cache: "no-store" });
        if (!resultResponse.ok) {
          throw new Error("Failed to load final analysis result.");
        }
        analysisResult = await resultResponse.json();
      } else {
        analysisResult = job;
      }

      // Show finalizing state before the full result is revealed.
      setStage("finalizing");
      setEstimatedTimeRemaining(null);

      setTimeout(() => {
        setResult(analysisResult);
        setStage("complete");
        setProgressPercent(100);
        window.dispatchEvent(new Event("recents:update"));
      }, 3000);

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
        // If the backend provides a detected input type on upload, honor it
        setBackendInputType(uploads?.[0]?.input_type || uploads?.[0]?.detected_input_type || null);
      } else if (input.trim()) {
        const trimmedInput = input.trim();
        const isLink = /^https?:\/\//i.test(trimmedInput);

        if (isLink) {
          const checkResponse = await apiFetch(
            `/api/public-analysis-results/check?url=${encodeURIComponent(trimmedInput)}`,
            { cache: "no-store" },
          );
          if (checkResponse.ok) {
            const checkPayload = await checkResponse.json();
            if (checkPayload?.found) {
              setExistingPublic({
                analysis_id: checkPayload.analysis_id,
                created_at: checkPayload.created_at,
              });
              setLoading(false);
              setStage("idle");
              return;
            }
          }
        }

        const inputResponse = await apiFetch("/api/inputs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kind: isLink ? "link" : "text",
            content: trimmedInput,
          }),
        });

        if (!inputResponse.ok) {
          throw new Error("Input submission failed.");
        }

        const upload = await inputResponse.json();
        uploadId = upload?.id;
        // If the backend returns a detected input type for the pasted input, use it
        setBackendInputType(upload?.input_type || upload?.detected_input_type || null);
      } else {
        setLoading(false);
        setStage("idle");
        return;
      }

      if (!uploadId) {
        throw new Error("Upload ID missing.");
      }

      setPipelinePhase("audio");
      setTimelineStep(0);
      setTimelineDurations(getTimelineDurations());
      setStage("queued");
      const asyncResponse = await apiFetch(`/api/analyze/${uploadId}/async`, {
        method: "POST",
      });

      if (asyncResponse.ok) {
        const payload: JobResponse = await asyncResponse.json();
        // Prefer backend-detected input type when available
        setBackendInputType((payload as any)?.input_type || (payload as any)?.detected_input_type || null);
        const newJobId = payload?.job_id || payload?.id || payload?.jobId || null;
        if (!newJobId) {
          throw new Error("Missing async job id.");
        }

        setJobId(newJobId);
        setStatusMessage(payload.status_message ?? null);
        setProgressPercent(
          typeof payload.progress_percent === "number"
            ? payload.progress_percent
            : getProgressPercent(mapBackendStatus(payload.status, payload.progress_percent))
        );
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
      // Capture backend-detected input type if available
      setBackendInputType((data as any)?.input_type || (data as any)?.detected_input_type || null);
      setStage("finalizing");
      setTimeout(() => {
        setResult(data);
        setStage("complete");
        setProgressPercent(100);
        window.dispatchEvent(new Event("recents:update"));
      }, 3000);
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Failed to analyze input.");
    } finally {
      setLoading(false);
    }
  };

  const dashboard = normalizeDashboardResult(result);
  const visualStage: AnalysisStage = stage;
  const computedStatusMessage = stage === "error"
    ? (statusMessage || "Processing failed.")
    : stage === "complete"
    ? "Result ready."
    : "Processing in progress...";

  // Determine input type and agents (prefer backend detection when available)
  const inferredType = file ? (file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "text") : input.trim() ? "text" : null;
  const inputType = backendInputType ?? inferredType;
  const agentKeys = inputType === "video" ? ["audio", "text", "video"] : inputType === "audio" ? ["audio", "text"] : ["text"];

  const advancePipelinePhase = (currentProgress: number) => {
    // Use more balanced thresholds so agents visibly transition during analysis.
    // For video inputs: audio -> text -> video (approx 0-33%, 33-66%, 66-100%).
    if (inputType === "video") {
      if (pipelinePhase === "audio" && currentProgress >= 33) {
        setPipelinePhase("text");
      } else if (pipelinePhase === "text" && currentProgress >= 66) {
        setPipelinePhase("video");
      }
    }

    // For audio inputs: audio -> text (approx 0-50%, 50-100%).
    if (inputType === "audio") {
      if (pipelinePhase === "audio" && currentProgress >= 50) {
        setPipelinePhase("text");
      }
    }
  };

  const getAgentState = (agentKey: string, _currentProgress?: number): AgentState => {
    if (stage === "complete") return "completed";
    if (stage === "error") return "queued";
    if (stage === "idle") return "queued";

    if (inputType === "video") {
      if (agentKey === "audio") {
        return pipelinePhase === "audio" ? "running" : "completed";
      }
      if (agentKey === "text") {
        if (pipelinePhase === "audio") return "queued";
        if (pipelinePhase === "text") return "running";
        return "completed";
      }
      if (agentKey === "video") {
        return pipelinePhase === "video" ? "running" : "queued";
      }
    }

    if (inputType === "audio") {
      if (agentKey === "audio") {
        return pipelinePhase === "audio" ? "running" : "completed";
      }
      if (agentKey === "text") {
        return pipelinePhase === "audio" ? "queued" : "running";
      }
    }

    if (inputType === "text") {
      if (agentKey === "text") return "running";
    }

    return "queued";
  };

  useEffect(() => {
    if (stage === "idle" || stage === "complete" || stage === "error" || stage === "finalizing") return;
    if (timelineStep >= timelineDurations.length - 1) return;

    // Hold at Analyzing content (step 2) until result is ready
    if (timelineStep === 2 && !result && stage === "analyzing") {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimelineStep((current) => Math.min(current + 1, timelineDurations.length - 1));
      setProgressPercent((current) => {
        const nextPercent = current + 12 + Math.floor(Math.random() * 12);
        return Math.min(nextPercent, 94);
      });
    }, timelineDurations[timelineStep]);

    return () => window.clearTimeout(timer);
  }, [stage, timelineStep, timelineDurations, result]);

  // Advance timeline to step 3 (Finalizing) when result is ready
  useEffect(() => {
    if (stage === "finalizing" && timelineStep < 3) {
      setTimelineStep(3);
    }
  }, [stage, timelineStep]);

  // Rotate through agent messages
  useEffect(() => {
    if (stage !== "analyzing" && stage !== "preparing" && stage !== "queued" && stage !== "finalizing") return;
    const timer = setInterval(() => {
      setMessageIndex((prev) => prev + 1);
    }, 2800);
    return () => clearInterval(timer);
  }, [stage]);

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
            <form onSubmit={handleAnalyze} className="space-y-6">
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
              <div className="grid gap-6 items-start lg:grid-cols-[1.6fr_1fr]">
                <div
                  className="rounded-[1.5rem] border border-dashed border-cyan-300/20 bg-[linear-gradient(180deg,rgba(11,22,46,0.38),rgba(8,17,36,0.28))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm sm:p-8"
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

{stage !== "idle" && !result && (
            <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border border-(--app-shell-border) bg-(--app-shell-panel) px-6 py-10">
              {stage === "error" ? (
                <div className="flex flex-col items-center text-center">
                  <AlertCircle className="h-12 w-12 text-red-400" />
                  <h2 className="mt-4 text-xl font-semibold text-white">Processing failed</h2>
                  <p className="mt-2 text-sm text-slate-300">{statusMessage || "Something went wrong during processing."}</p>
                  <button
                    onClick={() => {
                      setStage("idle");
                      setResult(null);
                      setJobId(null);
                      setProgressPercent(0);
                      setStatusMessage(null);
                      setMessageIndex(0);
                      backendStatusRef.current = "";
                      closeJobEvents();
                    }}
                    className="mt-6 rounded-lg border border-(--app-shell-border) bg-(--app-shell-panel) px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-(--app-shell-panel-2)"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center text-center">
                    <h2 className="text-xl font-semibold text-white">Processing...</h2>
                    <p className="mt-2 text-sm text-slate-300">{file?.name ? `${file.name} is being processed.` : "Your input is being processed."}</p>
                  </div>

                  <div className="mt-10 w-full max-w-5xl">
                    <div className="relative grid gap-6 sm:grid-cols-4">
                      {ANALYSIS_STEPS.map((step, index) => {
                        const currentIndex = Math.min(timelineStep, ANALYSIS_STEPS.length - 1);
                        const isActive = index === currentIndex;
                        const isCompleted = index < currentIndex;
                        const isFuture = index > currentIndex;
                        const stepStatus = isCompleted ? "Done" : isActive ? "Working" : "Waiting";

                        return (
                          <div key={step.key} className="relative rounded-[1.75rem] border p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition duration-300 hover:border-slate-500 sm:hover:-translate-y-0.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-white transition ${
                                  isCompleted
                                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                                    : isActive
                                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                                    : "border-slate-700 bg-slate-950 text-slate-500"
                                }`}
                              >
                                <step.icon className="h-6 w-6" />
                                {isCompleted && (
                                  <span className="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[0.65rem] font-bold text-slate-950">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{step.title}</p>
                                <p className="mt-1 text-xs text-slate-400">{stepStatus}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  <button
                    onClick={() => {
                      setStage("idle");
                      setResult(null);
                      setJobId(null);
                      setProgressPercent(0);
                      setStatusMessage(null);
                      setMessageIndex(0);
                      backendStatusRef.current = "";
                      closeJobEvents();
                    }}
                    className="mt-6 rounded-lg border border-(--app-shell-border) bg-(--app-shell-panel) px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-(--app-shell-panel-2)"
                  >
                    Cancel
                  </button>
                </>
              )}
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

