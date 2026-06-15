import Image from "next/image";

export default function AnalyzerNarrativeDashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07101d] px-4 py-10" style={{ backgroundImage: "var(--app-shell-bg-gradient)" }}>
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 px-6 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-indigo-400 animate-spin" />
          <div className="relative h-28 w-28 rounded-full bg-indigo-400/10 shadow-[0_0_0_18px_rgba(15,23,42,0.22)] flex items-center justify-center border border-white/10">
            <Image
              src="/logo_spin.png"
              alt="Loading"
              width={88}
              height={88}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
            Loading Pulse dashboard
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Preparing narrative intelligence data...
          </p>
        </div>
      </div>
    </div>
  );
}
