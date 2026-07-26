"use client";

import { useAppStore } from "@/store/useAppStore";
import MetricCard from "@/components/dashboard/MetricCard";
import EnergyChart from "@/components/dashboard/EnergyChart";
import TemperatureChart from "@/components/dashboard/TemperatureChart";
import OccupancyChart from "@/components/dashboard/OccupancyChart";
import AgentActivityFeed from "@/components/dashboard/AgentActivityFeed";
import AIReasoningCard from "@/components/dashboard/AIReasoningCard";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import LoopStatus from "@/components/dashboard/LoopStatus";
import ClosedLoopVisualization from "@/components/dashboard/ClosedLoopVisualization";
import { useEffect } from "react";

export default function Dashboard() {
  const { summary, simLoading, connectWebSocket, fetchLatestSimulation } = useAppStore();

  useEffect(() => {
    connectWebSocket();
    fetchLatestSimulation();
  }, [connectWebSocket, fetchLatestSimulation]);

  const hasEnergy = summary.energy != null;
  const hasTemp = summary.temperature != null;
  const hasOcc = summary.occupancy != null;
  const hasSavings = summary.savings != null;

  return (
    <div className="space-y-4">
      <OnboardingModal />

      {/* ── Row 1: Pipeline Timeline, KPIs, and Active AI Optimization Decision ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch animate-fade-up stagger-1">
        {/* Left: Loop Pipeline Status timeline (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col">
          <ClosedLoopVisualization />
        </div>

        {/* Center: 2x2 grid of compact KPI cards (col-span-3) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <MetricCard
            title="Energy Demand"
            value={hasEnergy ? summary.energy! : "—"}
            unit="kW"
            change={hasEnergy ? "-4.2%" : undefined}
            loading={simLoading}
          />
          <MetricCard
            title="Indoor Temperature"
            value={hasTemp ? summary.temperature! : "—"}
            unit="°C"
            change={hasTemp ? "+0.2°C" : undefined}
            loading={simLoading}
          />
          <MetricCard
            title="Building Occupancy"
            value={hasOcc ? summary.occupancy! : "—"}
            unit="ppl"
            change={hasOcc ? "+5%" : undefined}
            loading={simLoading}
          />
          <MetricCard
            title="Carbon & Cost Savings"
            value={hasSavings ? `${summary.savings}%` : "—"}
            change={hasSavings ? "+1.5%" : undefined}
            loading={simLoading}
          />
        </div>

        {/* Right: Active AI Optimization Decision (col-span-5) */}
        <div className="lg:col-span-4 flex flex-col">
          <AIReasoningCard />
        </div>
      </div>

      {/* ── Row 2: Energy & Temperature Charts ──────────────── */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up stagger-2">
        <EnergyChart />
        <TemperatureChart />
      </div>

      {/* ── Row 3: Occupancy Statistics, Loop Status, and Agent Activity Feed side-by-side (1/3 each) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch animate-fade-up stagger-3">
        <div className="flex flex-col">
          <OccupancyChart />
        </div>
        <div className="flex flex-col">
          <LoopStatus />
        </div>
        <div className="flex flex-col">
          <AgentActivityFeed />
        </div>
      </div>

    </div>
  );
}
