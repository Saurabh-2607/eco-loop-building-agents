"use client";

import { useAppStore } from "@/store/useAppStore";
import MetricCard from "@/components/dashboard/MetricCard";
import EnergyChart from "@/components/dashboard/EnergyChart";
import TemperatureChart from "@/components/dashboard/TemperatureChart";
import OccupancyChart from "@/components/dashboard/OccupancyChart";
import SystemStatus from "@/components/dashboard/SystemStatus";
import RecentActions from "@/components/dashboard/RecentActions";
import AIReasoningCard from "@/components/dashboard/AIReasoningCard";
import { useEffect } from "react";
import { Zap, Thermometer, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { summary, connectWebSocket, fetchLatestSimulation } = useAppStore();

  useEffect(() => {
    connectWebSocket();
    fetchLatestSimulation();
  }, [connectWebSocket, fetchLatestSimulation]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Energy Demand"
          value={summary.energy}
          unit="kW"
          change="-4.2%"
          trend="down"
          icon={<Zap className="h-5 w-5 text-emerald-500 fill-current" />}
        />
        <MetricCard
          title="Indoor Temperature"
          value={summary.temperature}
          unit="°C"
          change="+0.2°C"
          trend="up"
          icon={<Thermometer className="h-5 w-5 text-amber-500" />}
        />
        <MetricCard
          title="Building Occupancy"
          value={summary.occupancy}
          unit="Persons"
          change="+5%"
          trend="up"
          icon={<Users className="h-5 w-5 text-indigo-500" />}
        />
        <MetricCard
          title="Carbon & Cost Savings"
          value={`${summary.savings}%`}
          change="+1.5%"
          trend="up"
          icon={<TrendingUp className="h-5 w-5 text-sky-500" />}
        />
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EnergyChart />
        <TemperatureChart />
      </div>

      {/* 3. AI decisions and system status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIReasoningCard />
        <SystemStatus />
      </div>

      {/* 4. Logs & Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActions />
        <OccupancyChart />
      </div>
    </div>
  );
}
