"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiArrowUpRight,
  FiFileText,
  FiImage,
  FiLock,
  FiMusic,
  FiShield,
  FiZap,
  FiVideo,
} from "react-icons/fi";
import AnnouncementBanner from "../components/announcement-banner";

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="relative flex h-11 w-[560px] items-center rounded-full border border-white/10 bg-[#0f1526] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-white/20"
      aria-pressed={enabled}
      aria-label="Toggle landing page mode"
    >
      <span
        className={`absolute left-1 top-1 h-9 w-[266px] rounded-full transition-all duration-300 ${
          enabled
            ? "translate-x-[282px] bg-linear-to-r from-[#8b5cf6] via-[#a855f7] to-[#7c3aed]"
            : "bg-linear-to-r from-[#f7c948] to-[#ffb703]"
        }`}
      />
      <span className={`relative z-10 flex w-1/2 flex-col items-center justify-center px-4 text-[11px] font-bold leading-none tracking-[0.16em] ${enabled ? "text-white/25" : "text-[#111827]"}`}>
        <span>SYNTHETIC DEEPFAKE</span>
        <span className="mt-1">DETECTION</span>
      </span>
      <span className={`relative z-10 flex w-1/2 items-center justify-center px-4 text-[11px] font-bold tracking-[0.16em] ${enabled ? "text-white" : "text-white/30"}`}>
        PULSE + TIMESIGHT
      </span>
      <span
        className={`absolute top-1.5 h-8 w-8 rounded-full bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_18px_rgba(255,255,255,0.18)] transition-all duration-300 ${
          enabled ? "left-[287px]" : "left-[6px]"
        }`}
      />
    </button>
  );
}

function OriginalLanding({ pulseMode, setPulseMode }: { pulseMode: boolean; setPulseMode: (value: boolean) => void }) {
  const features = [
    { title: "Advanced Detection", description: "Identify deepfakes and manipulated media using cutting-edge AI models with enterprise-grade accuracy.", icon: FiShield },
    { title: "Real-time Analysis", description: "Analyze images, audio, video, and text instantly with ultra-fast processing pipelines.", icon: FiZap },
    { title: "Detailed Insights", description: "Get confidence scores, forensic breakdowns, and manipulation indicators in seconds.", icon: FiActivity },
    { title: "Enterprise Security", description: "Built with secure infrastructure, encrypted workflows, and compliance-ready architecture.", icon: FiLock },
  ];
  const workflow = [
    { step: "01", title: "Upload Media", text: "Upload image, video, audio, or text for AI verification." },
    { step: "02", title: "AI Processing", text: "Advanced neural models scan and analyze manipulation traces." },
    { step: "03", title: "Generate Report", text: "Receive confidence scores and detailed forensic insights." },
    { step: "04", title: "Take Action", text: "Review results and respond instantly to potential threats." },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#030b1e] text-white">
      <AnnouncementBanner />
      <section className="relative isolate overflow-hidden pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,210,48,0.15),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(29,107,255,0.18),transparent_35%),linear-gradient(180deg,#020817_0%,#030b1e_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#ffd230]/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-112 w-md rounded-full bg-[#1d6bff]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pt-7 md:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-2xl md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ffd230]/40 bg-[#101b3f] text-[#ffd230]">◈</div>
              <span className="text-lg font-bold tracking-wide">TRINETRA</span>
            </div>
            <ToggleSwitch enabled={pulseMode} onChange={setPulseMode} />
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 md:block">Login</Link>
              <Link href="/signup" className="rounded-xl bg-linear-to-r from-[#ffd230] to-[#ffb703] px-5 py-2.5 text-sm font-semibold text-[#071127] transition hover:scale-[1.03]">Get Started</Link>
            </div>
          </header>
          <div className="relative mt-16 grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium tracking-wide text-[#ffd230] backdrop-blur-xl">Enterprise AI Protection</span>
              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                <span className="text-white">Detect</span>
                <span className="bg-linear-to-r from-[#fff3b0] via-[#ffd230] to-[#ff8c42] bg-clip-text text-transparent"> Deepfake</span>
                <span className="block bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">Before It Spreads</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/70 md:text-lg">AI-powered deepfake detection platform built for enterprises, media organizations, and security teams to identify manipulated content with real-time forensic intelligence.</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/signup" className="rounded-2xl bg-linear-to-r from-[#ffd230] to-[#ffb703] px-7 py-4 text-sm font-semibold text-[#071127] transition hover:scale-[1.03]">Try Trinetra</Link>
                <a href="#how-it-works" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10">How It Works</a>
              </div>
              <div className="mt-12 flex flex-wrap gap-10">
                <div><p className="text-3xl font-bold text-[#ffd230]">21</p><p className="mt-1 text-sm text-white/60">Test Cases Evaluated</p></div>
                <div><p className="text-3xl font-bold text-[#ffd230]">4/4</p><p className="mt-1 text-sm text-white/60">Modalities Covered</p></div>
                <div><p className="text-3xl font-bold text-[#ffd230]">24/7</p><p className="mt-1 text-sm text-white/60">Deepfake Detection</p></div>
              </div>
            </div>
            <aside className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#ffd230]/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-white/60">Live Analysis Dashboard</p><h3 className="mt-1 text-xl font-semibold">Threat Detection</h3></div>
                  <a href="/Trinetra_Benchmark_Report_May2026.pdf" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 rounded-full border border-[#1d6bff]/25 bg-linear-to-r from-[#0b1638]/80 via-[#12244d]/75 to-[#0b1638]/80 px-3 py-1 text-[13px] font-semibold text-white/90 backdrop-blur-xl transition hover:border-[#ffd230]/30 hover:from-[#0b1638] hover:via-[#153064]/80 hover:to-[#0b1638]" aria-label="Open Trinetra Benchmark Report (PDF) in a new tab"><FiFileText className="text-base text-[#ffd230]" /><span className="whitespace-nowrap">Benchmark Report</span><span className="grid h-7 w-7 place-items-center rounded-full bg-linear-to-r from-[#ffd230] via-[#ffb703] to-[#1d6bff] text-[#061127] shadow-[0_0_0_1px_rgba(255,255,255,0.10)] transition group-hover:scale-[1.03]"><FiArrowUpRight className="text-[15px]" /></span></a>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#12244d]/70 p-5"><p className="text-4xl font-bold text-[#ffd230]">94.3%</p><p className="mt-2 text-sm text-white/60">Detection Accuracy</p></div>
                  <div className="rounded-2xl border border-white/10 bg-[#12244d]/70 p-5"><p className="text-4xl font-bold text-[#ffd230]">51.15 sec</p><p className="mt-2 text-sm text-white/60">Avg Analysis Time</p></div>
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-[#12244d]/50 p-5">
                  <div className="mb-3 flex items-center justify-between text-sm text-white/70"><span>Detection Confidence</span><span>94.3%</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[94.3%] rounded-full bg-linear-to-r from-[#ffd230] to-[#ff9f1a]" /></div>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                  {[{ label: "Image", icon: FiImage }, { label: "Video", icon: FiVideo }, { label: "Audio", icon: FiMusic }, { label: "Text", icon: FiFileText }].map((item) => (<div key={item.label} className="rounded-2xl border border-white/10 bg-[#12244d]/60 p-4 transition hover:-translate-y-1 hover:border-[#ffd230]/30"><item.icon className="mx-auto text-xl text-[#ffd230]" /><p className="mt-2 text-xs text-white/70">{item.label}</p></div>))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="relative bg-[#f5f7fb] px-5 py-24 text-[#121826] md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#c29d03]">Features</p>
          <h2 className="mt-4 text-center text-4xl font-black md:text-5xl">Built for Modern Media Security</h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-[#5b6475]">Enterprise-grade tools designed to identify, analyze, and prevent synthetic media threats at scale.</p>
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => { const Icon = feature.icon; return (<article key={feature.title} className="group rounded-[28px] border border-[#e5e7eb] bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3f6fc] text-[#1d2f5f] transition group-hover:bg-[#ffd230]/10 group-hover:text-[#ffd230]"><Icon className="text-2xl" /></div><h3 className="mt-6 text-2xl font-bold">{feature.title}</h3><p className="mt-4 text-sm leading-8 text-[#5b6475]">{feature.description}</p></article>); })}
          </div>
        </div>
      </section>
      <section id="how-it-works" className="relative overflow-hidden bg-[#020d24] px-5 py-24 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,210,48,0.12),transparent_35%),radial-gradient(circle_at_20%_100%,rgba(29,107,255,0.15),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#ffd230]">Workflow</p>
          <h2 className="mt-4 text-center text-4xl font-black md:text-5xl">Fast. Accurate. Intelligent.</h2>
          <div className="relative mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item) => (<article key={item.step} className="rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ffd230]/20 bg-[#132651] text-lg font-bold text-[#ffd230]">{item.step}</span><h3 className="mt-6 text-2xl font-bold">{item.title}</h3><p className="mt-4 text-sm leading-8 text-white/70">{item.text}</p></article>))}
          </div>
        </div>
      </section>
      <footer className="border-t border-white/10 bg-[#020817] px-5 py-10 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 text-sm text-white/70 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 text-white"><span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#ffd230]/50 text-[#ffd230]">◈</span><span className="text-lg font-semibold">TRINETRA</span></div>
            <p className="mt-3 max-w-xs leading-6">AI-powered deepfake detection platform protecting organizations from synthetic content threats.</p>
            <p className="mt-6 text-xs text-white/55">© 2026 TRINETRA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PulseLanding({ setPulseMode }: { setPulseMode: (value: boolean) => void }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <AnnouncementBanner variant="pulse" />
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(107,70,193,0.16),transparent_25%),radial-gradient(circle_at_75%_36%,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#04060f_0%,#050816_100%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-6 md:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-[rgba(10,14,28,0.82)] px-4 py-3 backdrop-blur-2xl md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/10 text-violet-300">◈</div>
              <span className="text-lg font-bold tracking-[0.2em]">TRINETRA</span>
            </div>
            <ToggleSwitch enabled onChange={setPulseMode} />
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 md:block">Login</Link>
              <Link href="/signup" className="rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.03] shadow-[0_0_25px_rgba(168,85,247,0.22)]">Get Started</Link>
            </div>
          </header>
          <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200 shadow-[0_0_25px_rgba(168,85,247,0.08)]">Pulse + TimeSight</span>
              <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.03] tracking-tight text-white md:text-7xl">
                <span className="block">Track Misinformation</span>
                <span className="block">Before It <span className="bg-linear-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Goes Viral</span></span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">Pulse identifies emerging narratives in real time. TimeSight predicts their future spread using temporal analysis and viral acceleration modeling.</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/signup" className="rounded-2xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-7 py-4 text-sm font-semibold text-white transition hover:scale-[1.03] shadow-[0_0_28px_rgba(168,85,247,0.25)]">Check Pulse & TimeSight</Link>
                <a href="#pulse-sections" className="rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white/85 backdrop-blur-xl transition hover:bg-white/8">Explore How It Works</a>
              </div>
            </div>
            <div className="relative flex min-h-[420px] items-center justify-center">
              <div className="absolute h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
              <div className="relative h-[410px] w-[410px]">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.10),rgba(70,28,149,0.18)_18%,rgba(9,12,24,0.96)_64%)] shadow-[0_0_130px_rgba(99,102,241,0.20)]" />
                <div className="absolute inset-2 rounded-full border border-white/[0.05]" />
                <div className="absolute inset-8 rounded-full border border-violet-300/10" />
                <div className="absolute inset-14 rounded-full border border-white/[0.03]" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_26%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_64%_70%,rgba(34,211,238,0.08),transparent_22%),radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.12),transparent_42%)]" />
                <div className="absolute left-10 top-20 h-12 w-12 rounded-full bg-fuchsia-500/20 shadow-[0_0_25px_rgba(217,70,239,0.38)]" />
                <div className="absolute right-10 top-18 h-12 w-12 rounded-full bg-sky-500/20 shadow-[0_0_25px_rgba(56,189,248,0.38)]" />
                <div className="absolute bottom-18 left-14 h-12 w-12 rounded-full bg-violet-500/20 shadow-[0_0_25px_rgba(168,85,247,0.38)]" />
                <div className="absolute bottom-18 right-14 h-12 w-12 rounded-full bg-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.38)]" />
                <svg viewBox="0 0 410 410" className="absolute inset-0 h-full w-full opacity-85">
                  <defs>
                    <radialGradient id="globeFade" cx="50%" cy="45%" r="55%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                      <stop offset="55%" stopColor="rgba(255,255,255,0.02)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                  </defs>
                  <circle cx="205" cy="205" r="176" fill="url(#globeFade)" />
                  <circle cx="205" cy="205" r="168" fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="1" />
                  <circle cx="205" cy="205" r="138" fill="none" stroke="rgba(96,165,250,0.14)" strokeWidth="1" />
                  <ellipse cx="205" cy="205" rx="165" ry="158" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <path d="M54 154 C124 112, 286 112, 356 154" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.1" />
                  <path d="M46 214 C120 178, 290 178, 364 214" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.1" />
                  <path d="M58 276 C128 326, 282 326, 352 276" fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1.1" />
                  <path d="M165 34 C146 95, 146 315, 165 376" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1.1" />
                  <path d="M245 34 C264 95, 264 315, 245 376" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1.1" />
                  <circle cx="142" cy="130" r="3" fill="#c084fc" />
                  <circle cx="258" cy="118" r="3" fill="#38bdf8" />
                  <circle cx="112" cy="216" r="3" fill="#a855f7" />
                  <circle cx="292" cy="198" r="3" fill="#60a5fa" />
                  <circle cx="166" cy="284" r="3" fill="#d946ef" />
                  <circle cx="244" cy="270" r="3" fill="#22d3ee" />
                  <line x1="142" y1="130" x2="258" y2="118" stroke="rgba(167,139,250,0.22)" strokeWidth="1" />
                  <line x1="112" y1="216" x2="292" y2="198" stroke="rgba(96,165,250,0.18)" strokeWidth="1" />
                  <line x1="166" y1="284" x2="244" y2="270" stroke="rgba(34,211,238,0.18)" strokeWidth="1" />
                </svg>
                <div className="absolute left-2 top-20 rounded-full border border-white/10 bg-[#0a1020]/82 px-3 py-1 text-[11px] font-semibold text-white/82 shadow-[0_0_20px_rgba(168,85,247,0.12)]">
                  YouTube
                </div>
                <div className="absolute right-2 top-22 rounded-full border border-white/10 bg-[#0a1020]/82 px-3 py-1 text-[11px] font-semibold text-white/82 shadow-[0_0_20px_rgba(56,189,248,0.12)]">
                  Telegram
                </div>
                <div className="absolute bottom-18 left-4 rounded-full border border-white/10 bg-[#0a1020]/82 px-3 py-1 text-[11px] font-semibold text-white/82 shadow-[0_0_20px_rgba(217,70,239,0.12)]">
                  X / Twitter
                </div>
                <div className="absolute bottom-18 right-4 rounded-full border border-white/10 bg-[#0a1020]/82 px-3 py-1 text-[11px] font-semibold text-white/82 shadow-[0_0_20px_rgba(96,165,250,0.12)]">
                  Facebook
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="pulse-sections" className="border-t border-white/[0.06] bg-[#050814] px-5 py-16 md:px-8">
        <div className="mx-auto max-w-7xl space-y-10 rounded-[30px] border border-white/[0.06] bg-[#070b17] p-6 md:p-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-violet-300">01</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Meet <span className="text-violet-200">Pulse</span> & <span className="text-cyan-200">TimeSight</span></h2>
            <p className="mx-auto mt-3 max-w-3xl text-white/55">Two powerful engines working together to detect, understand, and predict misinformation at every stage.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[{ title: "Pulse", subtitle: "Narrative Intelligence", tone: "violet", bullets: ["Detect emerging narratives early", "Cluster related stories and keywords", "Track entities, sources & sentiment", "Monitor across YouTube, Telegram, X & more"], desc: "Pulse continuously scans digital ecosystems to identify emerging narratives, themes, and claims as they surface." }, { title: "TimeSight", subtitle: "Temporal Analysis & Viral Acceleration", tone: "cyan", bullets: ["Predict future spread with high accuracy", "Measure viral acceleration in real time", "Identify peak virality & decay patterns", "Estimate reach and potential impact"], desc: "TimeSight analyzes how narratives evolve over time and predicts their future reach using advanced acceleration modeling." }].map((card) => (
              <article key={card.title} className="rounded-[28px] border border-white/10 bg-[#090d1a] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
                <h3 className={`text-3xl font-bold ${card.tone === "violet" ? "text-violet-200" : "text-cyan-200"}`}>{card.title}</h3>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/40">{card.subtitle}</p>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/58">{card.desc}</p>
                <ul className="mt-6 space-y-3 text-white/68">
                  {card.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3"><span className={`mt-[7px] h-2 w-2 rounded-full ${card.tone === "violet" ? "bg-violet-400" : "bg-cyan-400"}`} /><span>{item}</span></li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-white/[0.06] bg-[#050814] px-5 py-14 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-white/[0.06] bg-[#070b17] p-6 md:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-violet-300">02</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Latest from Trinetra News</h2>
            <p className="mt-2 text-sm text-white/60">Insights, reports, and analysis from our YouTube channel.</p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-4">
            {[
              { title: "Weekly Fake News Report", meta: "May 12, 2026  •  12K views" },
              { title: "Viral Misinformation Breakdown", meta: "May 10, 2026  •  9.3K views" },
              { title: "Election Narrative Analysis", meta: "May 8, 2026  •  11K views" },
              { title: "Deepfake Threat Watch", meta: "May 6, 2026  •  8.1K views" },
            ].map((item, index) => (
              <article key={item.title} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b1020]">
                <div className={`relative h-44 bg-gradient-to-br ${index === 0 ? "from-[#4a1454] via-[#11102b] to-[#090916]" : index === 1 ? "from-[#17214a] via-[#0b1020] to-[#090916]" : index === 2 ? "from-[#4b0d14] via-[#120d10] to-[#090916]" : "from-[#08234a] via-[#07111f] to-[#090916]"}`}>
                  <div className="absolute inset-0 flex items-center justify-center text-white/90">
                    <div className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-black/30 text-2xl">▶</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs text-white/55">{item.meta}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <a href="https://www.youtube.com/@Trinetra_news-c8c" target="_blank" rel="noopener noreferrer" className="rounded-full border border-violet-400/25 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20">
              Watch on YouTube
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-[#050814] px-5 py-14 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-white/[0.06] bg-[#070b17] p-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-300">03</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Our Services</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Real-Time Monitoring", text: "24/7 monitoring of digital platforms for emerging misinformation narratives." },
              { title: "Narrative Intelligence", text: "AI-powered classification, clustering, and tracking of narratives and themes." },
              { title: "Predictive Analytics", text: "Temporal modeling to predict viral acceleration and future narrative reach." },
              { title: "Actionable Alerts", text: "Instant alerts and actionable insights to help teams respond effectively." },
            ].map((item) => (
              <article key={item.title} className="rounded-[22px] border border-white/[0.06] bg-[#0a0e1a] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300 shadow-[0_0_20px_rgba(168,85,247,0.18)]">
                  <FiActivity />
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/58">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-[#050814] px-5 py-14 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-white/[0.06] bg-[#070b17] p-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-300">04</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Our Process</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-5">
            {[
              { step: "1", title: "Detect", text: "Pulse identifies emerging narratives across multiple platforms." },
              { step: "2", title: "Analyze", text: "TimeSight analyzes temporal patterns and calculates viral acceleration." },
              { step: "3", title: "Predict", text: "Predict future reach, peak virality, and potential impact." },
              { step: "4", title: "Report", text: "Generate intelligence reports with insights and recommendations." },
              { step: "5", title: "Act", text: "Share alerts and reports to take action and mitigate misinformation." },
            ].map((item) => (
              <article key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-white shadow-[0_0_18px_rgba(168,85,247,0.22)]">
                  {item.step}
                </div>
                <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/15 bg-[#0d1630] text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.1)]">
                  <FiActivity />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/56">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-[#050814] px-5 py-14 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-white/[0.06] bg-[#070b17] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-300">05</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">About Trinetra</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                Trinetra is an AI-powered real-time misinformation intelligence platform that empowers organizations, media houses, and governments to detect, predict, and respond to misinformation before it impacts society.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {["AI-Powered Intelligence", "Real-Time Monitoring", "Cross-Platform Coverage", "Actionable Insights"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/[0.06] bg-[#0b1020] p-4 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_16px_rgba(168,85,247,0.16)]">
                    <FiZap />
                  </div>
                  <p className="text-sm font-medium text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const [pulseMode, setPulseMode] = useState(false);
  return pulseMode ? <PulseLanding setPulseMode={setPulseMode} /> : <OriginalLanding pulseMode={pulseMode} setPulseMode={setPulseMode} />;
}
