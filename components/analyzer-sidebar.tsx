"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  LogOut,
} from "lucide-react";
import { useAnalyzerSession } from "@/components/analyzer-session";

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
  "--sidebar": "#07111f",
  "--sidebar-background": "#07111f",
  "--sidebar-foreground": "#e2e8f0",
  "--sidebar-primary": "#22d3ee",
  "--sidebar-primary-foreground": "#04111c",
  "--sidebar-accent": "rgba(255,255,255,0.06)",
  "--sidebar-accent-foreground": "#f8fafc",
  "--sidebar-border": "rgba(148,163,184,0.16)",
  "--sidebar-ring": "rgba(34,211,238,0.32)",
} as CSSProperties;

const scanItem = { label: "Scan", icon: Activity, active: true };

export function AnalyzerSidebar() {
  const router = useRouter();
  const { clearSession } = useAnalyzerSession();

  async function handleLogout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await fetch("/api/logout", {
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
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/15 text-2xl leading-none text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.22)] group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:text-xl">
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
              <SidebarMenuItem key={scanItem.label}>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={scanItem.active}
                  className="data-[slot=sidebar-menu-button]:p-1.5! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center"
                >
                  <Link href="/analyzer">
                    <scanItem.icon className="size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">{scanItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
