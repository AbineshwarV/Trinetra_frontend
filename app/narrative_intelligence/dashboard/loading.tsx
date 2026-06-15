import Image from "next/image";

export default function NarrativeDashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/90 px-4 py-10">
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-white/10 bg-slate-900/90 px-6 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-950/80">
            <Image src="/logo.png" alt="Loading" fill className="object-contain" priority />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
            Loading narrative dashboard
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Preparing the intelligence workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
