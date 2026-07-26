"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Cpu, Sliders, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";
import SimulationProgress from "@/components/simulation/SimulationProgress";
import LoadingOverlay from "@/components/simulation/LoadingOverlay";

export default function Simulation() {
  const { 
    simState, 
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Boot transition loader */}
      <LoadingOverlay />

      {/* Run State Panel */}
      <div className="lg:col-span-1 space-y-6">

        {/* Live Timeline Stepper */}
        <SimulationProgress />

        {/* Core Controls */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PlayCircle className="h-4.5 w-4.5 text-zinc-500" />
              Process Control
            </CardTitle>
            <CardDescription>Control EnergyPlus engine runtime process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Simulation Status Badge */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Current Status</span>
              <Badge className={`font-semibold ${isRunning ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                {simState.status.toUpperCase()}
              </Badge>
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
                className={`flex-1 font-semibold text-xs h-9 ${isRunning ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
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
                className="font-semibold text-xs h-9 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reset
              </Button>
            </div>

            {/* Speed Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Simulator Speed Factor</label>
              <div className="grid grid-cols-5 gap-1.5">
                {speedOptions.map((opt) => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={simState.speedMultiplier === opt ? "default" : "outline"}
                    onClick={() => setSpeedMultiplier(opt)}
                    className="h-8 text-xs font-semibold"
                  >
                    {opt}x
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EnergyPlus Metadata Panel */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-zinc-500" />
              Engine Metadata
            </CardTitle>
            <CardDescription>Active compiler & profile attributes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">IDF Model</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                  {simState.currentModel || "small_office.idf"}
                </span>
              </div>
              <div className="flex justify-between items-start text-xs gap-4">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider flex-shrink-0">Weather File</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 text-xs font-medium break-all text-right">
                  {simState.currentWeather || "USA_IL_Chicago-OHare.Intl.AP.725300_TMY3.epw"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Duration</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">24 Hours (Full Schedule)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">EnergyPlus Version</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">V23.2.0 (Compiled Engine)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Current Speed</span>
                <Badge variant="outline" className="font-semibold text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                  {simState.speedMultiplier}x Factor
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Overrides */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-zinc-500" />
              Manual Override
            </CardTitle>
            <CardDescription>Bypass LangGraph agent controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* HVAC override */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span>HVAC cooling setpoint</span>
                <span className="text-amber-500 font-semibold">{manualHvac.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="18.0"
                max="28.0"
                step="0.5"
                value={manualHvac}
                onChange={(e) => setManualHvac(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Lighting Override */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span>Lighting Intensity</span>
                <span className="text-sky-500 font-semibold">{manualLight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={manualLight}
                onChange={(e) => setManualLight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <Button 
              onClick={handleApplyOverride}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs h-9 border border-zinc-800"
            >
              Apply Manual Actuations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Output Console Log terminal */}
      <div className="lg:col-span-2">
        <Card className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-zinc-500" />
              EnergyPlus Stdout Feed
            </CardTitle>
            <CardDescription>Live telemetry stream from active runtime wrapper thread</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex flex-col p-4 bg-zinc-950 rounded-b-xl border-t border-zinc-900">
            <div className="flex-1 font-mono text-xs text-zinc-400 overflow-y-auto space-y-2 p-2 select-text">
              {logs.map((log) => (
                <div key={log.id} className="leading-relaxed flex gap-2">
                  <span className="text-zinc-600">[{log.timestamp}]</span>
                  <span className={`font-semibold ${
                    log.level === "INFO" ? "text-emerald-500" :
                    log.level === "WARNING" ? "text-amber-500" : "text-rose-500"
                  }`}>
                    [{log.level}]
                  </span>
                  <span className="text-zinc-500">[{log.service}]</span>
                  <span className="text-zinc-300">{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
