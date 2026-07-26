"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Sliders, PlayCircle, Terminal } from "lucide-react";
import { useState, useEffect } from "react";
import SimulationProgress from "@/components/simulation/SimulationProgress";
import LoadingOverlay from "@/components/simulation/LoadingOverlay";

export default function Simulation() {
  const { 
    simState, 
    metrics,
    logs, 
    setSimStatus, 
    setSpeedMultiplier, 
    startSimulation, 
    applyOverrides,
    connectWebSocket,
    fetchLatestSimulation
  } = useAppStore();
  
  const [manualHvac, setManualHvac] = useState(22.0);
  const [manualLight, setManualLight] = useState(80);

  // Initialize socket listener and query latest simulation parameters on load
  useEffect(() => {
    connectWebSocket();
    fetchLatestSimulation();
  }, [connectWebSocket, fetchLatestSimulation]);

  const isRunning = simState.status === "running";
  const speedOptions = [1, 5, 10, 20, 50];

  const handleApplyOverride = () => {
    applyOverrides(manualHvac, manualLight);
  };

  return (
    <div className="animate-fade-in">
      {/* Boot transition loader */}
      <LoadingOverlay />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Fixed Width on Desktop (460px) containing all Controls */}
        <div className="flex flex-col gap-6 lg:w-[460px] flex-shrink-0 w-full">
          
          {/* Core Process Controls */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PlayCircle className="h-4.5 w-4.5 text-neutral-500" />
                Process Control
              </CardTitle>
              <CardDescription>Control EnergyPlus engine runtime process</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Simulation Status & Clock Row */}
              <div
                className="bg-neutral-50/50 border border-neutral-100 p-3.5 flex flex-col gap-2.5"
                style={{ borderRadius: 16 }}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Current Status</span>
                  <Badge
                    className="font-extrabold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-1 border animate-fade-in"
                    style={{
                      backgroundColor: isRunning ? "#fafafa" : "#ffffff",
                      borderColor: isRunning ? "#e5e5e5" : "#f0f0f0",
                      color: isRunning ? "#16a34a" : "#737373",
                    }}
                  >
                    {simState.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center w-full border-t border-neutral-100/50 pt-2.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Simulated Clock</span>
                  <span className="font-mono text-xs font-bold text-neutral-900">
                    {metrics.length > 0 ? `${metrics[metrics.length - 1].timestamp} (Hour ${metrics.length} of 24)` : "00:00 (Idle)"}
                  </span>
                </div>
              </div>

              {/* Run Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (isRunning) {
                      setSimStatus("paused");
                    } else {
                      startSimulation("Chicago Office Standard Simulation");
                    }
                  }}
                  className="flex-1 text-xs h-9 font-semibold transition-colors"
                  style={{
                    backgroundColor: isRunning ? "#ffffff" : "#171717",
                    color: isRunning ? "#171717" : "#ffffff",
                    border: isRunning ? "1px solid #e5e5e5" : "none",
                  }}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-1.5" />
                      Pause Simulation
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1.5 fill-current" />
                      Start Simulation
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSimStatus("idle")}
                  className="text-xs h-9 font-semibold px-4"
                  style={{ borderColor: "#e5e5e5", backgroundColor: "#ffffff" }}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reset
                </Button>
              </div>

              {/* Speed Options */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">Simulator Speed Factor</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {speedOptions.map((opt) => (
                    <Button
                      key={opt}
                      size="sm"
                      variant={simState.speedMultiplier === opt ? "default" : "outline"}
                      onClick={() => setSpeedMultiplier(opt)}
                      className="h-8 text-xs font-semibold"
                      style={
                        simState.speedMultiplier === opt
                          ? { backgroundColor: "#171717", color: "#ffffff" }
                          : { backgroundColor: "#ffffff", borderColor: "#e5e5e5", color: "#171717" }
                      }
                    >
                      {opt}x
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Overrides */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-neutral-500" />
                Manual Override
              </CardTitle>
              <CardDescription>Bypass LangGraph agent controls</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* HVAC override */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-450">
                  <span>HVAC cooling setpoint</span>
                  <span className="text-neutral-900 font-bold">{manualHvac.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="18.0"
                  max="28.0"
                  step="0.5"
                  value={manualHvac}
                  onChange={(e) => setManualHvac(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  style={{ background: "#e5e5e5" }}
                />
              </div>

              {/* Lighting Override */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-450">
                  <span>Lighting Intensity</span>
                  <span className="text-neutral-900 font-bold">{manualLight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={manualLight}
                  onChange={(e) => setManualLight(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  style={{ background: "#e5e5e5" }}
                />
              </div>

              <Button 
                onClick={handleApplyOverride}
                className="w-full text-xs h-9 font-semibold"
                style={{ backgroundColor: "#171717", color: "#ffffff" }}
              >
                Apply Manual Actuations
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Fills Remaining Width (Visualization timeline + logs output) */}
        <div className="flex flex-col gap-6 flex-1 w-full">
          
          {/* Horizontal Building Optimization Pipeline */}
          <SimulationProgress />

          {/* Full-Width Diagnostics Console Feed */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-neutral-500" />
                EnergyPlus Stdout Feed
              </CardTitle>
              <CardDescription>Live telemetry stream from active runtime wrapper thread</CardDescription>
            </CardHeader>
            <div 
              className="font-mono text-[11px] overflow-y-auto space-y-2 p-5 select-text h-[350px] border-t border-neutral-900"
              style={{ backgroundColor: "#09090b" }}
            >
                {logs.length === 0 ? (
                  <div className="text-center py-20 text-neutral-550 italic" style={{ color: "#737373" }}>
                    Stdout pipe empty. Start a simulation to stream live telemetry output.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="leading-relaxed flex gap-2 flex-wrap md:flex-nowrap animate-fade-in">
                      <span style={{ color: "#737373" }}>[{log.timestamp}]</span>
                      <span 
                        style={{
                          fontWeight: 700,
                          color: log.level === "INFO" ? "#10b981" : log.level === "WARNING" ? "#f59e0b" : "#ef4444"
                        }}
                      >
                        [{log.level}]
                      </span>
                      <span style={{ color: "#a3a3a3" }}>[{log.service}]</span>
                      <span style={{ color: "#e5e5e5" }}>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
