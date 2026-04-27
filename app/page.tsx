import Link from "next/link";

export default function Home() {
  const navItems = ["Product", "Solutions", "Resources", "Pricing", "About Us"];
  const trustedBy = ["Acme Corp", "ShieldGuard", "NexusBank", "CyberSafe", "InnoTech"];
  const features = [
    {
      title: "Advanced Detection",
      description:
        "Identify deepfakes and synthetic media using state-of-the-art algorithms with industry-leading accuracy.",
      icon: "◎",
    },
    {
      title: "Real-time Analysis",
      description:
        "Analyze media in real-time and get instant results with minimal latency to act faster.",
      icon: "◔",
    },
    {
      title: "Detailed Insights",
      description:
        "Get comprehensive reports with confidence scores and detailed manipulation indicators.",
      icon: "▦",
    },
    {
      title: "Enterprise Security",
      description:
        "Bank-grade security with end-to-end encryption and compliance with global standards.",
      icon: "◉",
    },
  ];

  const workflow = [
    {
      step: "1",
      title: "Upload Media",
      text: "Upload image, video, audio or provide a live feed.",
    },
    {
      step: "2",
      title: "AI Analysis",
      text: "Our system scans the media using advanced models.",
    },
    {
      step: "3",
      title: "Get Results",
      text: "Receive results with confidence scores in seconds.",
    },
    {
      step: "4",
      title: "Take Action",
      text: "Review detailed reports and take appropriate action.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#030b1e] text-white">
      <section className="relative isolate overflow-hidden pb-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,199,0,0.22),transparent_40%),radial-gradient(circle_at_80%_35%,rgba(63,120,255,0.25),transparent_35%),linear-gradient(180deg,#031230_0%,#020a1d_70%)]" />
        <div className="pointer-events-none absolute -left-40 top-16 h-80 w-80 rounded-full bg-[#ffd230]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-96 w-96 rounded-full bg-[#1d6bff]/20 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-6 md:px-8 md:pt-8">
          <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ffd230]/50 bg-[#0d1734] text-[#ffd230]">
                ◈
              </span>
              <span className="text-lg font-semibold tracking-wide">TRINETRA</span>
            </div>
            <nav className="hidden items-center gap-7 text-sm text-white/80 lg:flex">
              {navItems.map((item) => (
                <a key={item} href="#" className="transition hover:text-white">
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-lg px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 md:block"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#ffd230] px-4 py-2 text-sm font-semibold text-[#071127] transition hover:bg-[#ffdf69] md:px-5"
              >
                Get Started →
              </Link>
            </div>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-[#0c1838]/70 px-3 py-1 text-xs text-white/90">
                Enterprise Ready
              </span>
              <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                All-in-one
                <span className="block text-[#ffd230]">Deepfake Detection</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/75 md:text-lg">
                Leverage cutting-edge technology to detect manipulated media with unparalleled accuracy. Protect your
                organization from synthetic content threats in real-time.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#ffd230] px-6 py-3 text-sm font-semibold text-[#071127] transition hover:bg-[#ffdf69]"
                >
                  Get Started →
                </Link>
                <button className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Book a Demo
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-sm text-white/80">
                <span>98% Accuracy</span>
                <span>Real-time Analysis</span>
                <span>Enterprise Security</span>
              </div>
            </div>

            <aside className="rounded-3xl border border-white/15 bg-[#101d3f]/70 p-5 backdrop-blur-xl">
              <p className="text-sm text-white/70">Analysis Overview</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#16284e] p-4">
                  <p className="text-4xl font-bold text-[#ffd230]">98%</p>
                  <p className="mt-1 text-xs text-white/65">Accuracy</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#16284e] p-4">
                  <p className="text-4xl font-bold text-[#ffd230]">35m</p>
                  <p className="mt-1 text-xs text-white/65">Media Processed</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm text-white/70">
                  <span>Detection Confidence</span>
                  <span>98%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[98%] rounded-full bg-[#ffd230]" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs text-white/75">
                {[
                  { label: "Image", icon: "▧" },
                  { label: "Video", icon: "▶" },
                  { label: "Audio", icon: "◍" },
                  { label: "Live", icon: "◉" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-[#16284e] p-3">
                    <p className="text-base text-[#ffd230]">{item.icon}</p>
                    <p className="mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0a1838]/70 px-4 py-4 md:px-6">
            <p className="mb-3 text-center text-xs text-white/60 md:text-left">Trusted by leading organizations</p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-white/85 md:justify-between">
              {trustedBy.map((brand) => (
                <span key={brand}>{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f6f8] px-5 py-16 text-[#121826] md:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#c29d03]">Features</p>
          <h2 className="mt-3 text-center text-3xl font-bold md:text-4xl">Powerful Features for Complete Protection</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-[#e4e7ec] bg-white p-6 shadow-sm">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f6fb] text-lg text-[#1d2f5f]">
                  {feature.icon}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#515a6b]">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#020d24] px-5 py-16 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,210,48,0.15),transparent_35%),radial-gradient(circle_at_20%_100%,rgba(29,107,255,0.2),transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd230]">How It Works</p>
          <h2 className="mt-3 text-center text-3xl font-bold md:text-4xl">Simple. Fast. Accurate.</h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item) => (
              <article key={item.step} className="rounded-2xl border border-white/10 bg-[#0b1a3f]/80 p-6 text-center">
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ffd230]/40 bg-[#132651] text-lg text-[#ffd230]">
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <article className="rounded-2xl border border-white/10 bg-[#0b1a3f]/80 p-6">
              <p className="text-5xl text-[#ffd230]">“</p>
              <p className="mt-2 max-w-xl text-lg text-white/90">
                TRINETRA has revolutionized how we approach content verification. The accuracy and speed are unmatched.
              </p>
              <p className="mt-5 text-sm font-semibold text-[#ffd230]">Rahul Mehta</p>
              <p className="text-sm text-white/65">CTO, CyberSafe Solutions</p>
            </article>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Enterprise Clients", value: "500+" },
                { label: "Media Analyzed", value: "2M+" },
                { label: "Accuracy Rate", value: "98%" },
              ].map((stat) => (
                <article key={stat.label} className="rounded-2xl border border-white/10 bg-[#0b1a3f]/80 p-5 text-center">
                  <p className="text-4xl font-bold text-[#ffd230]">{stat.value}</p>
                  <p className="mt-2 text-sm text-white/75">{stat.label}</p>
                </article>
              ))}
            </div>
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
