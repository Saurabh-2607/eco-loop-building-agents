"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Cpu, Network, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings, addLog } = useAppStore();

  // Local inputs state
  const [apiUrl, setApiUrl] = useState(settings.apiUrl);
  const [wsUrl, setWsUrl] = useState(settings.wsUrl);
  const [ollamaHost, setOllamaHost] = useState(settings.ollamaHost);
  const [modelName, setModelName] = useState(settings.modelName);
  const [minCool, setMinCool] = useState(settings.minCoolingSetpoint);
  const [maxCool, setMaxCool] = useState(settings.maxCoolingSetpoint);

  const handleSave = () => {
    updateSettings({
      apiUrl,
      wsUrl,
      ollamaHost,
      modelName,
      minCoolingSetpoint: parseFloat(minCool.toString()),
      maxCoolingSetpoint: parseFloat(maxCool.toString()),
    });
    addLog({
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO",
      service: "backend",
      message: `System configuration values updated by operator.`
    });
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Network APIs */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Network className="h-4.5 w-4.5 text-zinc-500" />
            API & Endpoint Configuration
          </CardTitle>
          <CardDescription>Configure routing endpoints linking components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">FastAPI Base URL</label>
              <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">WebSocket Address</label>
              <Input value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Ollama Server Host</label>
            <Input value={ollamaHost} onChange={(e) => setOllamaHost(e.target.value)} className="h-9 text-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Cognitive options */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-zinc-500" />
            Intelligence Engine Model
          </CardTitle>
          <CardDescription>Select target reasoning weights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Active LLM Model</label>
            <Input value={modelName} onChange={(e) => setModelName(e.target.value)} className="h-9 text-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Safety constraints bounds */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-zinc-500" />
            Building Comfort Boundaries
          </CardTitle>
          <CardDescription>Safety limit thresholds enforced on actuator commands</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Min Cooling Setpoint (°C)</label>
              <Input type="number" step="0.5" value={minCool} onChange={(e) => setMinCool(parseFloat(e.target.value))} className="h-9 text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Max Cooling Setpoint (°C)</label>
              <Input type="number" step="0.5" value={maxCool} onChange={(e) => setMaxCool(parseFloat(e.target.value))} className="h-9 text-xs" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end select-none">
        <Button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-6 shadow-sm hover:shadow"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
