"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: ReactNode;
}

export default function MetricCard({ 
  title, 
  value, 
  unit, 
  change, 
  trend = "neutral", 
  icon 
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Label Title */}
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</span>
          
          {/* Rounded Icon wrapper */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400">
            {icon}
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          {/* Main KPI Value */}
          <span className={cn(
            "font-bold tracking-tight text-zinc-950 dark:text-white",
            typeof value === "string" && value.includes("No") ? "text-sm text-zinc-400 font-medium" : "text-3xl"
          )}>
            {value}
          </span>
          {unit && typeof value === "number" && (
            <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
              {unit}
            </span>
          )}
        </div>

        {/* Change trends indications */}
        {change && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            <span className={cn(
              "px-2 py-0.5 rounded-md",
              trend === "up" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              trend === "down" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              trend === "neutral" && "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
            )}>
              {change}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">vs last hour</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
