"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  Activity,
  Clock,
  FileText,
  LogOut,
} from "lucide-react";
import { useAnalyzerSession } from "@/components/analyzer-session";
import { apiFetch } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "./ui/sidebar";

const sidebarTheme = {
  "--sidebar": "var(--app-shell-bg-2)",
  "--sidebar-background": "var(--app-shell-bg-2)",
  "--sidebar-foreground": "#e2e8f0",
  "--sidebar-primary": "var(--app-shell-accent)",
  "--sidebar-primary-foreground": "var(--app-shell-bg-2)",
  "--sidebar-accent": "var(--app-shell-panel-2)",
  "--sidebar-accent-foreground": "#f8fafc",
  "--sidebar-border": "var(--app-shell-border)",
  "--sidebar-ring": "rgba(34,211,238,0.34)",
} as CSSProperties;

const navButtonClass =
  "data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center " +
  "data-[active=true]:border data-[active=true]:border-sky-300/18 data-[active=true]:bg-[linear-gradient(90deg,#5b4ae6_0%,#2f6fcb_100%)] " +
  "data-[active=true]:text-white data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(47,111,203,0.24)] " +
  "data-[active=true]:hover:bg-[linear-gradient(90deg,#5b4ae6_0%,#2f6fcb_100%)]";

type RecentItem = {
  analysis_id: string;
  filename: string;
  created_at: string;
  overall_status: string;
};

export function AnalyzerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { clearSession } = useAnalyzerSession();
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [isLoadingRecents, setIsLoadingRecents] = useState(true);

  useEffect(() => {
    setResolvedPath(pathname ?? null);
  }, [pathname]);

  const activePath = resolvedPath;
  const isScanActive = activePath === "/analyzer";
  const isRecentsActive = Boolean(activePath && (activePath.startsWith("/analyzer/recents") || activePath.startsWith("/analyzer/results")));

  const recentsDisplay = useMemo(() => recents.slice(0, 5), [recents]);

  useEffect(() => {
    let isMounted = true;

    async function loadRecents() {
      setIsLoadingRecents(true);
      try {
        const response = await apiFetch("/api/analysis-results?limit=5", { cache: "no-store" });
        if (!response.ok) {
          if (isMounted) setRecents([]);
          return;
        }
        const data = (await response.json()) as RecentItem[];
        if (isMounted) setRecents(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setRecents([]);
      } finally {
        if (isMounted) setIsLoadingRecents(false);
      }
    }

    loadRecents();

    const handleRecentsUpdate = () => {
      if (isMounted) {
        loadRecents();
      }
    };

    window.addEventListener("recents:update", handleRecentsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("recents:update", handleRecentsUpdate);
    };
  }, [pathname]);

  async function handleLogout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      clearAccessToken();
      await apiFetch("/api/logout", {
        method: "POST",
      });
    } finally {
      clearSession();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      style={sidebarTheme}
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="h-14 justify-center p-0">
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/analyzer">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl leading-none text-white shadow-[0_10px_30px_rgba(139,92,246,0.18)] group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:text-xl">
                  👁
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">TRiNETRA</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Deepfake Analyzer</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="-mt-px mx-0 bg-white/10" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="scan">
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={isScanActive}
                  className={navButtonClass}
                >
                  <Link href="/analyzer">
                    <Activity className="size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">Scan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem key="recents">
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={isRecentsActive}
                  className={navButtonClass}
                >
                  <Link href="/analyzer/recents">
                    <Clock className="size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">Recents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Recent files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoadingRecents ? (
                <SidebarMenuItem key="recents-loading">
                  <SidebarMenuButton
                    size="lg"
                    className="data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:hidden"
                  >
                    <FileText className="size-6" />
                    <span className="truncate">Loading...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : recentsDisplay.length ? (
                recentsDisplay.map((item) => (
                  <SidebarMenuItem key={item.analysis_id}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      className="data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:hidden"
                    >
                      <Link href={`/analyzer/results/${encodeURIComponent(item.analysis_id)}`}>
                        <FileText className="size-6" />
                        <span className="truncate" title={item.filename}>
                          {item.filename}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem key="recents-empty">
                  <SidebarMenuButton
                    size="lg"
                    className="data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:hidden"
                  >
                    <FileText className="size-6" />
                    <span className="truncate">No recents</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-1 pt-0">
        <SidebarSeparator className="mx-0 bg-sidebar-border/80" />
        <SidebarMenu>
          <SidebarMenuItem>
            <form onSubmit={handleLogout} className="w-full">
              <SidebarMenuButton
                size="lg"
                type="submit"
                className="w-full data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="size-6" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
