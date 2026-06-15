"use client";

import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { AnalyzerHeader } from "@/components/analyzer-header";
import { AnalyzerSessionProvider } from "@/components/analyzer-session";
import { AnalyzerSidebar } from "@/components/analyzer-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const shellStyle =
  {
    "--sidebar-width": "17.5rem",
    "--sidebar-width-icon": "3.5rem",
    "--sidebar-header-h": "65px",
  } as CSSProperties;

export default function AnalyzerLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen style={shellStyle}>
      <AnalyzerSessionProvider>
        <main className="relative min-h-screen w-full overflow-x-hidden bg-(--app-shell-bg) text-slate-100">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "var(--app-shell-bg-gradient)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-size-[72px_72px] opacity-15" />
          <div className="flex min-h-screen w-full min-w-0">
            <Suspense fallback={null}>
              <AnalyzerSidebar />
            </Suspense>
            <SidebarInset className="min-w-0 bg-transparent relative">
              <AnalyzerHeader />
              <div
                className="absolute left-0 bottom-0 w-px bg-sidebar-border"
                style={{ top: "var(--sidebar-header-h)" }}
              />
              <div className="pl-3">{children}</div>
            </SidebarInset>
          </div>
        </main>
      </AnalyzerSessionProvider>
    </SidebarProvider>
  );
}
