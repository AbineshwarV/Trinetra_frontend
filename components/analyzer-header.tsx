"use client";

import { Moon, Sun, User2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAnalyzerSession } from "@/components/analyzer-session";
import { useEffect, useState } from "react";

export function AnalyzerHeader() {
  const { user: sessionUser, isLoading } = useAnalyzerSession();
  const profileName = isLoading ? "Loading..." : (sessionUser?.name?.trim() ?? "");
  const profileEmail = isLoading ? "Loading..." : (sessionUser?.email?.trim() ?? "");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("trinetra_theme");
    if (stored === "light") return false;
    if (stored === "dark") return true;
    return window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("trinetra_theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-(--app-shell-border) bg-(--app-shell-panel) px-2 backdrop-blur-xl sm:px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="ml-auto min-w-0 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsDark((current) => !current)}
          aria-label="Toggle theme"
          suppressHydrationWarning
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--app-shell-border) bg-(--app-shell-panel) text-white/80 transition hover:bg-(--app-shell-panel-2) hover:text-white"
        >
          <span suppressHydrationWarning>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span>
        </button>
        {isLoading || sessionUser ? (
          <div className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1.5 text-white/90 sm:px-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-(--app-shell-accent-3) text-slate-950 sm:size-7">
              <User2 className="size-3.5 sm:size-4" />
            </div>
            <div className="grid min-w-0 text-left leading-tight">
              <span className="max-w-30 truncate text-sm font-semibold sm:max-w-40">{profileName}</span>
              <span className="hidden max-w-48 truncate text-xs text-slate-300 sm:block">{profileEmail}</span>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
