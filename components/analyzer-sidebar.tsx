"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Clock,
  FileText,
  SquareActivity,
  LogOut,
  Sparkles,
  Timer,
  Users,
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
  "--sidebar": "#0b1324",
  "--sidebar-background": "#0b1324",
  "--sidebar-foreground": "#e2e8f0",
  "--sidebar-primary": "#8b5cf6",
  "--sidebar-primary-foreground": "#ffffff",
  "--sidebar-accent": "#16233d",
  "--sidebar-accent-foreground": "#f8fafc",
  "--sidebar-border": "rgba(148,163,184,0.18)",
  "--sidebar-ring": "rgba(139,92,246,0.38)",
} as CSSProperties;

const navButtonClass =
  "data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center " +
  "data-[active=true]:border data-[active=true]:border-violet-300/20 data-[active=true]:bg-[linear-gradient(90deg,#5b4ae6_0%,#214f8d_100%)] " +
  "data-[active=true]:text-white data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(47,111,203,0.24)] " +
  "data-[active=true]:hover:bg-[linear-gradient(90deg,#5b4ae6_0%,#214f8d_100%)]";

type RecentItem = {
  analysis_id: string;
  filename: string;
  created_at: string;
  overall_status: string;
};

export function AnalyzerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { clearSession } = useAnalyzerSession();
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [isLoadingRecents, setIsLoadingRecents] = useState(true);
  const activePath = pathname ?? null;
  const source = searchParams?.get("source");
  const isPublicResult = Boolean(source === "public" && activePath?.startsWith("/analyzer/results"));
  const isScanActive = activePath === "/analyzer";
  const isPublicActive = Boolean(activePath && activePath.startsWith("/analyzer/public")) || isPublicResult;
  const isRecentsActive = Boolean(activePath && activePath.startsWith("/analyzer/recents")) || (Boolean(activePath && activePath.startsWith("/analyzer/results")) && !isPublicResult);
  const isNarrativeActive = Boolean(activePath && activePath.startsWith("/analyzer/narrative_intelligence"));
  const isNarrativeDashboardActive = Boolean(
    activePath &&
      (activePath === "/analyzer/narrative_intelligence" ||
        activePath === "/analyzer/narrative_intelligence/dashboard")
  );
  const isNarrativeTemporalActive = Boolean(
    activePath && activePath.startsWith("/analyzer/narrative_intelligence/temporal-analysis")
  );

  const recentsDisplay = useMemo(() => recents.slice(0, 5), [recents]);

  useEffect(() => {
    let isMounted = true;

    async function loadRecents() {
      setIsLoadingRecents(true);
      try {
        const [privateResponse, publicResponse] = await Promise.all([
          apiFetch("/api/analysis-results?limit=5", { cache: "no-store" }),
          apiFetch("/api/public-analysis-results?limit=5&scope=me", { cache: "no-store" }),
        ]);

        if (!privateResponse.ok) {
          if (isMounted) setRecents([]);
          return;
        }

        const privateData = (await privateResponse.json()) as RecentItem[];
        const publicData = publicResponse.ok ? ((await publicResponse.json()) as RecentItem[]) : [];

        const merged = [
          ...(Array.isArray(privateData) ? privateData : []),
          ...(Array.isArray(publicData) ? publicData : []),
        ];
        merged.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));

        if (isMounted) setRecents(merged.slice(0, 5));
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
        {!isNarrativeActive ? (
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

                  <SidebarMenuItem key="public-scans">
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isPublicActive}
                      className={navButtonClass}
                    >
                      <Link href="/analyzer/public">
                        <Users className="size-6" />
                        <span className="group-data-[collapsible=icon]:hidden">Public scans</span>
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
        ) : null}

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Narrative & Temporal Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isNarrativeActive ? (
                <SidebarMenuItem key="narrative-back">
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    className={`${navButtonClass} text-sm`}
                  >
                    <Link href="/analyzer">
                      <ArrowLeft className="size-5" />
                      <span className="group-data-[collapsible=icon]:hidden">Back to main</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
              {!isNarrativeActive ? (
                <SidebarMenuItem key="narrative-intelligence">
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isNarrativeActive}
                    className={navButtonClass}
                  >
                    <Link href="/analyzer/narrative_intelligence/dashboard">
                      <Sparkles className="size-6" />
                      <span className="flex-1 group-data-[collapsible=icon]:hidden">Pulse & Timesight</span>
                      <ChevronRight className="size-5 text-white/70 group-data-[collapsible=icon]:hidden" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}

              {isNarrativeActive ? (
                <>
                  <SidebarMenuItem key="narrative-dashboard">
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isNarrativeDashboardActive}
                      className={`${navButtonClass} pl-10 text-sm`}
                    >
                      <Link href="/analyzer/narrative_intelligence/dashboard">
                        <SquareActivity className="size-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Pulse</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem key="narrative-temporal">
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isNarrativeTemporalActive}
                      className={`${navButtonClass} pl-10 text-sm`}
                    >
                      <Link href="/analyzer/narrative_intelligence/temporal-analysis">
                        <Timer className="size-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Time Sights</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isNarrativeActive ? (
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
        ) : null}

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
