import Link from "next/link";
import {
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiShield,
  FiZap,
  FiActivity,
  FiLock,
} from "react-icons/fi";

export default function Home() {
  const navItems = ["Product", "Solutions", "Resources", "Pricing", "About Us"];

  const features = [
    {
      title: "Advanced Detection",
      description:
        "Identify deepfakes and manipulated media using cutting-edge AI models with enterprise-grade accuracy.",
      icon: FiShield,
    },
    {
      title: "Real-time Analysis",
      description:
        "Analyze images, audio, video, and text instantly with ultra-fast processing pipelines.",
      icon: FiZap,
    },
    {
      title: "Detailed Insights",
      description:
        "Get confidence scores, forensic breakdowns, and manipulation indicators in seconds.",
      icon: FiActivity,
    },
    {
      title: "Enterprise Security",
      description:
        "Built with secure infrastructure, encrypted workflows, and compliance-ready architecture.",
      icon: FiLock,
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Upload Media",
      text: "Upload image, video, audio, or text for AI verification.",
    },
    {
      step: "02",
      title: "AI Processing",
      text: "Advanced neural models scan and analyze manipulation traces.",
    },
    {
      step: "03",
      title: "Generate Report",
      text: "Receive confidence scores and detailed forensic insights.",
    },
    {
      step: "04",
      title: "Take Action",
      text: "Review results and respond instantly to potential threats.",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#030b1e] text-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden pb-20">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,210,48,0.15),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(29,107,255,0.18),transparent_35%),linear-gradient(180deg,#020817_0%,#030b1e_100%)]" />

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />

        {/* Glow */}
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#ffd230]/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-112 w-md rounded-full bg-[#1d6bff]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pt-7 md:px-8">
          {/* HEADER */}
          <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-2xl md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ffd230]/40 bg-[#101b3f] text-[#ffd230]">
                ◈
              </div>

              <span className="text-lg font-bold tracking-wide">TRINETRA</span>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="transition hover:text-white"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-xl px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 md:block"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-linear-to-r from-[#ffd230] to-[#ffb703] px-5 py-2.5 text-sm font-semibold text-[#071127] transition hover:scale-[1.03]"
              >
                Get Started
              </Link>
            </div>
          </header>

          {/* HERO CONTENT */}
          <div className="relative mt-16 grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            {/* LEFT */}
            <div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium tracking-wide text-[#ffd230] backdrop-blur-xl">
                Enterprise AI Protection
              </span>

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                <span className="text-white">Detect</span>

                <span className="bg-linear-to-r from-[#fff3b0] via-[#ffd230] to-[#ff8c42] bg-clip-text text-transparent">
                  {" "}
                  Deepfake
                </span>

                <span className="block bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Before It Spreads
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/70 md:text-lg">
                AI-powered deepfake detection platform built for enterprises,
                media organizations, and security teams to identify manipulated
                content with real-time forensic intelligence.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="rounded-2xl bg-linear-to-r from-[#ffd230] to-[#ffb703] px-7 py-4 text-sm font-semibold text-[#071127] transition hover:scale-[1.03]"
                >
                  Try Trinetra
                </Link>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10">
                  How It Works
                </button>
              </div>

              {/* STATS */}
              <div className="mt-12 flex flex-wrap gap-10">
                <div>
                  <p className="text-3xl font-bold text-[#ffd230]">-</p>
                  <p className="mt-1 text-sm text-white/60">
                    Detection Accuracy
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold text-[#ffd230]">-</p>
                  <p className="mt-1 text-sm text-white/60">
                    Files Processed
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold text-[#ffd230]">24/7</p>
                  <p className="mt-1 text-sm text-white/60">
                    Deepfake Detection
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT DASHBOARD */}
            <aside className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              {/* Glow */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#ffd230]/20 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">
                      Live Analysis Dashboard
                    </p>

                    <h3 className="mt-1 text-xl font-semibold">
                      Threat Detection
                    </h3>
                  </div>

                  <span className="rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-3 py-1 text-xs text-[#4ade80]">
                    Live
                  </span>
                </div>

                {/* METRICS */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#12244d]/70 p-5">
                    <p className="text-4xl font-bold text-[#ffd230]">
                      -
                    </p>

                    <p className="mt-2 text-sm text-white/60">
                      AI Confidence
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#12244d]/70 p-5">
                    <p className="text-4xl font-bold text-[#ffd230]">-</p>

                    <p className="mt-2 text-sm text-white/60">
                      Avg Analysis Time
                    </p>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-[#12244d]/50 p-5">
                  <div className="mb-3 flex items-center justify-between text-sm text-white/70">
                    <span>Detection Confidence</span>
                    <span>-</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[98%] rounded-full bg-linear-to-r from-[#ffd230] to-[#ff9f1a]" />
                  </div>
                </div>

                {/* TYPES */}
                <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Image", icon: FiImage },
                    { label: "Video", icon: FiVideo },
                    { label: "Audio", icon: FiMusic },
                    { label: "Text", icon: FiFileText },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-[#12244d]/60 p-4 transition hover:-translate-y-1 hover:border-[#ffd230]/30"
                    >
                      <item.icon className="mx-auto text-xl text-[#ffd230]" />

                      <p className="mt-2 text-xs text-white/70">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative bg-[#f5f7fb] px-5 py-24 text-[#121826] md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#c29d03]">
            Features
          </p>

          <h2 className="mt-4 text-center text-4xl font-black md:text-5xl">
            Built for Modern Media Security
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-[#5b6475]">
            Enterprise-grade tools designed to identify, analyze, and prevent
            synthetic media threats at scale.
          </p>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-[28px] border border-[#e5e7eb] bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3f6fc] text-[#1d2f5f] transition group-hover:bg-[#ffd230]/10 group-hover:text-[#ffd230]">
                    <Icon className="text-2xl" />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-[#5b6475]">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="relative overflow-hidden bg-[#020d24] px-5 py-24 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,210,48,0.12),transparent_35%),radial-gradient(circle_at_20%_100%,rgba(29,107,255,0.15),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#ffd230]">
            Workflow
          </p>

          <h2 className="mt-4 text-center text-4xl font-black md:text-5xl">
            Fast. Accurate. Intelligent.
          </h2>

          <div className="relative mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item) => (
              <article
                key={item.step}
                className="rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ffd230]/20 bg-[#132651] text-lg font-bold text-[#ffd230]">
                  {item.step}
                </span>

                <h3 className="mt-6 text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-8 text-white/70">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#020817] px-5 py-10 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 text-sm text-white/70 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#ffd230]/50 text-[#ffd230]">
                ◈
              </span>
              <span className="text-lg font-semibold">TRINETRA</span>
            </div>
            <p className="mt-3 max-w-xs leading-6">
              AI-powered deepfake detection platform protecting organizations from synthetic content threats.
            </p>
            <p className="mt-6 text-xs text-white/55">© 2026 TRINETRA. All rights reserved.</p>
          </div>

          {[
            {
              title: "Product",
              links: ["Features", "How It Works", "Pricing", "Integrations"],
            },
            {
              title: "Solutions",
              links: ["Media", "Financial", "Government", "Cybersecurity"],
            },
            {
              title: "Resources",
              links: ["Blog", "Case Studies", "Documentation", "Support Center"],
            },
          ].map((column) => (
            <div key={column.title}>
              <p className="font-semibold text-white">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
