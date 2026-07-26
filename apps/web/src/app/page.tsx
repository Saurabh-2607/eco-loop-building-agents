"use client";

import { useAppStore } from "@/store/useAppStore";
import MetricCard from "@/components/dashboard/MetricCard";
import EnergyChart from "@/components/dashboard/EnergyChart";
import TemperatureChart from "@/components/dashboard/TemperatureChart";
import OccupancyChart from "@/components/dashboard/OccupancyChart";
import SystemStatus from "@/components/dashboard/SystemStatus";
import RecentActions from "@/components/dashboard/RecentActions";
import AIReasoningCard from "@/components/dashboard/AIReasoningCard";
import ClosedLoopVisualization from "@/components/dashboard/ClosedLoopVisualization";
import { useEffect } from "react";
import { Zap, Thermometer, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { summary, connectWebSocket, fetchLatestSimulation } = useAppStore();

  useEffect(() => {
    connectWebSocket();
    fetchLatestSimulation();
  }, [connectWebSocket, fetchLatestSimulation]);

  const hasEnergy = summary.energy !== undefined && summary.energy !== null;
  const hasTemp = summary.temperature !== undefined && summary.temperature !== null;
  const hasOcc = summary.occupancy !== undefined && summary.occupancy !== null;
  const hasSavings = summary.savings !== undefined && summary.savings !== null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Energy Demand"
          value={hasEnergy ? summary.energy! : "No live telemetry available"}
          unit="kW"
          change={hasEnergy ? "-4.2%" : undefined}
          trend={hasEnergy ? "down" : undefined}
          icon={<Zap className="h-5 w-5 text-emerald-500 fill-current" />}
        />
        <MetricCard
          title="Indoor Temperature"
          value={hasTemp ? summary.temperature! : "No live telemetry available"}
          unit="°C"
          change={hasTemp ? "+0.2°C" : undefined}
          trend={hasTemp ? "up" : undefined}
          icon={<Thermometer className="h-5 w-5 text-amber-500" />}
        />
        <MetricCard
          title="Building Occupancy"
          value={hasOcc ? summary.occupancy! : "No live telemetry available"}
          unit="Persons"
          change={hasOcc ? "+5%" : undefined}
          trend={hasOcc ? "up" : undefined}
          icon={<Users className="h-5 w-5 text-indigo-500" />}
        />
        <MetricCard
          title="Carbon & Cost Savings"
          value={hasSavings ? `${summary.savings}%` : "No live telemetry available"}
          change={hasSavings ? "+1.5%" : undefined}
          trend={hasSavings ? "up" : undefined}
          icon={<TrendingUp className="h-5 w-5 text-sky-500" />}
        />
      </div>

      {/* 2. Closed Loop Visualization */}
      <ClosedLoopVisualization />

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EnergyChart />
        <TemperatureChart />
      </div>

      {/* 4. AI decisions and system status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIReasoningCard />
        <SystemStatus />
      </div>

      {/* 5. Logs & Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActions />
        <OccupancyChart />
      </div>
    </div>
  );
}
