"use client";

import { User2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAnalyzerSession } from "@/components/analyzer-session";

export function AnalyzerHeader() {
  const { user: sessionUser, isLoading } = useAnalyzerSession();
  const profileName = sessionUser?.name?.trim() || (isLoading ? "Loading..." : "shadcn");
  const profileEmail = sessionUser?.email?.trim() || (isLoading ? "Loading..." : "m@example.com");

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-white/2 px-2 backdrop-blur-xl sm:px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="ml-auto min-w-0 flex items-center gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1.5 text-white/90 sm:px-3">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-cyan-400 text-slate-950 sm:size-7">
            <User2 className="size-3.5 sm:size-4" />
          </div>
          <div className="grid min-w-0 text-left leading-tight">
            <span className="max-w-30 truncate text-sm font-semibold sm:max-w-40">{profileName}</span>
            <span className="hidden max-w-48 truncate text-xs text-slate-300 sm:block">{profileEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
