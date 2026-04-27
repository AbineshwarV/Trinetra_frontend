"use client";


import type { CSSProperties, ChangeEvent, FormEvent } from "react";
import { useRef, useState } from "react";
import { ArrowRight, CloudUpload, Sparkles } from "lucide-react";
import { AnalyzerHeader } from "@/components/analyzer-header";
import { AnalyzerSidebar } from "@/components/analyzer-sidebar";
import { AnalyzerSessionProvider } from "@/components/analyzer-session";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";

export default function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setInput(""); // Clear text input if file selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
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
  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      let endpoint = "http://localhost:8000/predict/";
      if (file) {
        formData.append("file", file);
      } else if (input.trim()) {
        formData.append("input", input.trim());
      } else {
        setLoading(false);
        return;
      }
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to analyze input." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "17.5rem",
          "--sidebar-width-icon": "3.5rem",
        } as CSSProperties
      }
    >
      <AnalyzerSessionProvider>
        <main className="relative min-h-screen w-full overflow-hidden bg-[#050814] text-slate-100">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_28%)]" />
          <div className="flex min-h-screen w-full">
            <AnalyzerSidebar />

            <SidebarInset className="bg-transparent">
              <AnalyzerHeader />

              <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <div className="flex w-full flex-col gap-6">
                  <section className="rounded-[1.75rem] border border-white/10 bg-white/4 p-5 shadow-[0_30px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          Live analyzer
                        </div>

                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                          Deepfake Analyzer
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                          Scan suspicious media with a sharper review flow, stronger signal hierarchy, and a dashboard feel that
                          matches the rest of the product.
                        </p>
                      </div>

                    </div>
                  </section>

                  <form onSubmit={handleAnalyze}>
                    <section className="rounded-[1.75rem] border border-white/10 bg-[#08101f]/90 p-5 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:p-6 lg:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold text-white sm:text-2xl">Upload media</h2>
                          <p className="mt-2 text-sm text-slate-400">Drag and drop, or select a file to begin the review.</p>
                        </div>
                        <div className="hidden rounded-full border border-white/10 bg-white/3 px-3 py-1 text-xs text-slate-300 sm:block">
                          Supports video, audio, and text
                        </div>
                      </div>

                      <div
                        className="mt-6 rounded-[1.5rem] border border-dashed border-cyan-300/30 bg-[linear-gradient(180deg,rgba(8,15,31,0.96),rgba(6,10,20,0.98))] p-6 sm:p-8"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 shadow-[0_18px_50px_rgba(34,211,238,0.15)]">
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
                            onClick={handleSelectFiles}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-60"
                            disabled={!!input}
                          >
                            Select files
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          {file && (
                            <span className="text-xs text-cyan-200 ml-2">{file.name}</span>
                          )}
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
                            placeholder="Paste a URL or enter text..."
                            className="w-full rounded-xl border border-white/10 bg-[#050814]/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-linear-to-r from-cyan-400/10 via-white/5 to-sky-400/10 px-6 py-3 text-sm font-semibold text-cyan-100 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:border-cyan-300 hover:bg-cyan-400/20 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] disabled:opacity-60"
                        disabled={loading || (!file && !input.trim())}
                      >
                        {loading ? (
                          <span>Analyzing...</span>
                        ) : (
                          <>
                            Analyze
                            <Sparkles className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      {result && (
                        <div className="mt-6 rounded-lg bg-[#0a1628] border border-cyan-300/20 p-4 text-cyan-100 text-sm wrap-break-word">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                      )}
                    </section>
                  </form>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/3 px-5 py-4 text-sm text-slate-400 sm:px-6">
                    Recommended Video duration should be less than 5 minutes. Maximum file size: 100MB.
                  </div>
                </div>
              </div>
            </SidebarInset>
          </div>
        </main>
      </AnalyzerSessionProvider>
    </SidebarProvider>
  );
}