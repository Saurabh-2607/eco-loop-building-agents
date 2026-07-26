"use client";

import { useAppStore } from "@/store/useAppStore";
import { Loader2, Sparkles, Database } from "lucide-react";

export default function LoadingOverlay() {
  const { detailedStatus } = useAppStore();

  if (detailedStatus !== "initializing" && detailedStatus !== "loading_model") {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center select-none animate-fade-in">
      <div className="max-w-xs text-center space-y-6 p-6 border border-zinc-800 bg-zinc-950/90 rounded-2xl shadow-2xl relative">
        <div className="mx-auto h-16 w-16 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20 animate-pulse">
          {detailedStatus === "initializing" ? (
            <Sparkles className="h-8 w-8 fill-current" />
          ) : (
            <Database className="h-8 w-8 text-emerald-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-200">
            {detailedStatus === "initializing" ? "Starting EcoLoop Agent..." : "Loading building config..."}
          </h3>
          <p className="text-[11px] leading-relaxed text-zinc-400 font-medium">
            {detailedStatus === "initializing" 
              ? "Establishing telemetry stream boundaries & secure Ollama connection..." 
              : "Reading Standard Chicago Office thermal envelope IDF..."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-semibold font-mono">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
          ESTABLISHING PORT LINKS
        </div>
      </div>
    </div>
  );
}
