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
  Settings,
  Activity,
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
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard",    href: "/",             icon: LayoutDashboard },
  { name: "Analytics",   href: "/analytics",    icon: BarChart3 },
  { name: "Simulation",  href: "/simulation",   icon: Play },
  { name: "AI Decisions",href: "/ai-decisions", icon: Cpu },
  { name: "Settings",    href: "/settings",     icon: Settings },
];

const STATUS_MAP: Record<string, { label: string; substep: string; pulse: boolean }> = {
  initializing:         { label: "Loop Setup",      substep: "Booting engine threads",               pulse: false },
  loading_model:        { label: "Model Load",       substep: "Parsing IDF geometry",                 pulse: false },
  running_energyplus:   { label: "EnergyPlus",       substep: "Simulating HVAC thermal load",         pulse: true  },
  collecting_telemetry: { label: "Telemetry",        substep: "Aggregating zone timeseries",          pulse: true  },
  analyzing_data:       { label: "AI Analysis",      substep: "LangGraph isolating load leaks",       pulse: true  },
  generating_ai_report: { label: "Report Gen",       substep: "Drafting audit report markdown",       pulse: true  },
  applying_optimization:{ label: "Actuation",        substep: "Pushing setpoint changes",             pulse: true  },
  completed:            { label: "Completed",        substep: "Comfort bounds verified",              pulse: false },
  failed:               { label: "Pipeline Error",   substep: "System loop crash — check logs",      pulse: false },
};

export default function AppSidebar() {
  const pathname = usePathname();
  const { detailedStatus } = useAppStore();

  const status = STATUS_MAP[detailedStatus] ?? {
    label: "Idle",
    substep: "Awaiting simulation request",
    pulse: false,
  };

  return (
    <Sidebar className="border-r border-neutral-200 bg-white">
      {/* ── Brand header ─────────────────────────────────────── */}
      <SidebarHeader className="px-5 border-b border-neutral-200 bg-white" style={{ height: 59, borderRadius: 0 }}>
        <div className="flex items-center gap-3 h-full">
          {/* Wordmark triangle */}
          <div
            className="flex items-center justify-center bg-neutral-900 text-white select-none flex-shrink-0"
            style={{ width: 30, height: 30, borderRadius: 8, fontSize: 13, fontWeight: 700, lineHeight: 1 }}
            aria-hidden
          >
            ▲
          </div>

          {/* Text lockup */}
          <div className="flex flex-col justify-center min-w-0">
            <span
              className="font-semibold leading-none"
              style={{ fontSize: 14, letterSpacing: "-0.02em", color: "#171717" }}
            >
              EcoLoop
            </span>
            <span
              className="font-mono font-medium uppercase leading-none mt-1"
              style={{ fontSize: 10, letterSpacing: "0.08em", color: "#a3a3a3" }}
            >
              Building Agent
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ───────────────────────────────────────── */}
      <SidebarContent className="px-3 py-3 bg-white">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer w-full overflow-visible rounded-xl",
                        isActive ? "bg-neutral-100" : "hover:bg-neutral-50"
                      )}
                      style={{ color: isActive ? "#171717" : "#737373" }}
                    >
                      <item.icon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: isActive ? "#171717" : "#a3a3a3" }}
                        aria-hidden
                      />
                      <span className="truncate">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: active step tracker ──────────────────────── */}
      <SidebarFooter className="px-4 py-4 border-t border-neutral-200 bg-white" style={{ borderRadius: 0 }}>
        {/* Section label row */}
        <div className="flex items-center gap-2 mb-2">
          <Activity
            className={cn("h-3 w-3 flex-shrink-0", status.pulse && "animate-pulse")}
            style={{ color: "#a3a3a3" }}
            aria-hidden
          />
          <span
            className="font-mono font-bold uppercase"
            style={{ fontSize: 9, letterSpacing: "0.1em", color: "#a3a3a3" }}
          >
            Active Step
          </span>
        </div>

        {/* Step content */}
        <div className="space-y-0.5 pl-5">
          <p
            className="font-semibold leading-tight"
            style={{ fontSize: 12, letterSpacing: "-0.01em", color: "#171717" }}
          >
            {status.label}
          </p>
          <p
            className="leading-relaxed"
            style={{ fontSize: 11, color: "#737373" }}
          >
            {status.substep}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
