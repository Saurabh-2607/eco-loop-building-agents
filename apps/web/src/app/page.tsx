"use client";

import { useAppStore } from "@/store/useAppStore";
import MetricCard from "@/components/dashboard/MetricCard";
import EnergyChart from "@/components/dashboard/EnergyChart";
import TemperatureChart from "@/components/dashboard/TemperatureChart";
import OccupancyChart from "@/components/dashboard/OccupancyChart";
import SystemStatus from "@/components/dashboard/SystemStatus";
import AgentActivityFeed from "@/components/dashboard/AgentActivityFeed";
import AIReasoningCard from "@/components/dashboard/AIReasoningCard";
import ClosedLoopVisualization from "@/components/dashboard/ClosedLoopVisualization";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import EcoLoopWorkflow from "@/components/dashboard/EcoLoopWorkflow";
import LoopStatus from "@/components/dashboard/LoopStatus";
import NextStepAssistant from "@/components/dashboard/NextStepAssistant";
import { useEffect } from "react";
import { Zap, Thermometer, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { summary, simLoading, connectWebSocket, fetchLatestSimulation } = useAppStore();

  useEffect(() => {
    connectWebSocket();
    fetchLatestSimulation();
  }, [connectWebSocket, fetchLatestSimulation]);

  const hasEnergy = summary.energy !== undefined && summary.energy !== null;
  const hasTemp = summary.temperature !== undefined && summary.temperature !== null;
  const hasOcc = summary.occupancy !== undefined && summary.occupancy !== null;
  const hasSavings = summary.savings !== undefined && summary.savings !== null;

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Onboarding Dialog */}
      <OnboardingModal />

      {/* Floating Guided Assistant */}
      <NextStepAssistant />

      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Energy Demand"
          value={hasEnergy ? summary.energy! : "No live telemetry available"}
          unit="kW"
          change={hasEnergy ? "-4.2%" : undefined}
          trend={hasEnergy ? "down" : undefined}
          icon={<Zap className="h-5 w-5 text-emerald-500 fill-current" />}
          loading={simLoading}
        />
        <MetricCard
          title="Indoor Temperature"
          value={hasTemp ? summary.temperature! : "No live telemetry available"}
          unit="°C"
          change={hasTemp ? "+0.2°C" : undefined}
          trend={hasTemp ? "up" : undefined}
          icon={<Thermometer className="h-5 w-5 text-amber-500" />}
          loading={simLoading}
        />
        <MetricCard
          title="Building Occupancy"
          value={hasOcc ? summary.occupancy! : "No live telemetry available"}
          unit="Persons"
          change={hasOcc ? "+5%" : undefined}
          trend={hasOcc ? "up" : undefined}
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          loading={simLoading}
        />
        <MetricCard
          title="Carbon & Cost Savings"
          value={hasSavings ? `${summary.savings}%` : "No live telemetry available"}
          change={hasSavings ? "+1.5%" : undefined}
          trend={hasSavings ? "up" : undefined}
          icon={<TrendingUp className="h-5 w-5 text-sky-500" />}
          loading={simLoading}
        />
      </div>


      {/* 2. Closed Loop Visualization */}
      <ClosedLoopVisualization />

      {/* 3. Guide workflow section */}
      <EcoLoopWorkflow />

      {/* 4. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EnergyChart />
        <TemperatureChart />
      </div>

      {/* 5. AI decisions, System status, and Checklist Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIReasoningCard />
        <SystemStatus />
        <LoopStatus />
      </div>

      {/* 6. Logs & Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentActivityFeed />
        <OccupancyChart />
      </div>
    </div>
  );
}
