import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trinetra - Report",
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const srcParam = params.src;
  const src = Array.isArray(srcParam) ? srcParam[0] : srcParam;

  if (!src) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-slate-100">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h1 className="text-lg font-bold">Report URL missing</h1>
          <p className="mt-2 text-sm text-slate-300">Go back and click “View Report” again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817]">
      <iframe title="Trinetra - Report" src={src} className="h-screen w-screen border-0" />
    </main>
  );
}
