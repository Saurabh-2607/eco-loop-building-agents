"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  Play, 
  Cpu, 
  Settings 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Simulation", href: "/simulation", icon: Play },
  { name: "AI Decisions", href: "/ai-decisions", icon: Cpu },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { detailedStatus } = useAppStore();

  const statusInfo = (() => {
    switch (detailedStatus) {
      case "initializing":
        return { step: "Loop Setup", substep: "Booting engine threads", color: "bg-violet-500" };
      case "loading_model":
        return { step: "Model Load", substep: "Parsing Chicago Office Standard IDF", color: "bg-violet-500" };
      case "running_energyplus":
        return { step: "EnergyPlus Run", substep: "Simulating HVAC & lights thermal load", color: "bg-emerald-500 animate-pulse" };
      case "collecting_telemetry":
        return { step: "Sensing Telemetry", substep: "Aggregating timeseries zone values", color: "bg-emerald-500 animate-pulse" };
      case "analyzing_data":
        return { step: "AI Analysis", substep: "LangGraph isolating utility load leaks", color: "bg-indigo-500 animate-pulse" };
      case "generating_ai_report":
        return { step: "Report Gen", substep: "Ollama drafting audit report markdown", color: "bg-indigo-500 animate-pulse" };
      case "applying_optimization":
        return { step: "Actuation Update", substep: "Pushing target setpoint changes", color: "bg-sky-500 animate-pulse" };
      case "completed":
        return { step: "System Completed", substep: "Comfort bounds verified", color: "bg-emerald-500" };
      case "failed":
        return { step: "Pipeline Error", substep: "System loop crash", color: "bg-rose-500" };
      default:
        return { step: "System Idle", substep: "Awaiting simulation request", color: "bg-zinc-500" };
    }
  })();

  return (
    <Sidebar>
      {/* Brand Header */}
      <SidebarHeader className="h-16 flex flex-row items-center gap-3 px-6 border-b flex-shrink-0">
        <div className="text-foreground text-base font-bold flex-shrink-0">
          ▲
        </div>
        <div>
          <span className="font-bold text-foreground text-sm tracking-tight block">EcoLoop</span>
          <span className="text-muted-foreground text-[10px] font-bold font-mono tracking-wider block -mt-1">BUILDING AGENT</span>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      render={<Link href={item.href} />}
                      isActive={isActive}
                    >
                      <item.icon className="flex-shrink-0" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Info: Step and Substep Tracker using standard Card */}
      <SidebarFooter className="p-4 border-t">
        <Card className="bg-muted/40 shadow-none border-0">
          <CardContent className="p-3 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", statusInfo.color)} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Active Step</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-foreground tracking-tight">{statusInfo.step}</div>
              <div className="text-[10px] leading-relaxed text-muted-foreground font-medium">{statusInfo.substep}</div>
            </div>
          </CardContent>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}
