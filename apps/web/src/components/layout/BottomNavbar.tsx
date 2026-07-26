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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Simulation", href: "/simulation", icon: Play },
  { name: "AI Decisions", href: "/ai-decisions", icon: Cpu },
  { name: "Settings", href: "/settings", icon: Settings },
];

const STATUS_MAP: Record<string, { label: string; pulse: boolean }> = {
  initializing: { label: "Loop Setup", pulse: false },
  loading_model: { label: "Model Load", pulse: false },
  running_energyplus: { label: "EnergyPlus", pulse: true },
  collecting_telemetry: { label: "Telemetry", pulse: true },
  analyzing_data: { label: "AI Analysis", pulse: true },
  generating_ai_report: { label: "Report Gen", pulse: true },
  applying_optimization: { label: "Actuation", pulse: true },
  completed: { label: "Completed", pulse: false },
  failed: { label: "Loop Error", pulse: false },
};

export default function BottomNavbar() {
  const pathname = usePathname();
  const { detailedStatus } = useAppStore();

  const status = STATUS_MAP[detailedStatus] ?? {
    label: "Idle",
    pulse: false,
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center border p-1.5 shadow-2xl select-none flex-wrap sm:flex-nowrap gap-1 sm:gap-0"
      style={{
        borderRadius: 16, // rounded-2xl
        backgroundColor: "#171717", // Solid high-contrast charcoal black
        borderColor: "#262626", // Dark border line
      }}
    >
      {/* Brand logo container */}
      <div className="flex items-center pl-2.5 pr-2 flex-shrink-0">
        <span className="text-md font-extrabold tracking-tight ml-2 mr-1 text-white">
          EcoLoop
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-neutral-800 mx-2 flex-shrink-0" />

      {/* Navigation tabs */}
      <div className="flex items-center gap-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer",
                isActive
                  ? "bg-white text-neutral-950 font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
              style={{ borderRadius: 12 }}
            >
              <item.icon
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: isActive ? "#0a0a0a" : "#a3a3a3" }}
              />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-neutral-800 mx-2 flex-shrink-0" />

      {/* Active step tracking info on right */}
      <div className="hidden sm:flex items-center gap-2 pr-3.5 pl-1.5 flex-shrink-0">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status.pulse ? "animate-pulse" : ""
          )}
          style={{
            backgroundColor: status.pulse ? "#10b981" : "#737373"
          }}
        />
        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#a3a3a3" }}>
          {status.label}
        </span>
      </div>
    </div>
  );
}
