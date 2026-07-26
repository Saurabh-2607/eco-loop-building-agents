"use client";

import { useAppStore } from "@/store/useAppStore";
import { Loader2, Check, Circle } from "lucide-react";

export default function SimulationLifecycleOverlay() {
  const { detailedStatus } = useAppStore();

  // The overlay is displayed during the starting warm-up phase of the simulation
  const showOverlay = detailedStatus === "initializing" || detailedStatus === "loading_model";

  if (!showOverlay) return null;

  const steps = [
    {
      id: "initializing",
      label: "Initializing EnergyPlus",
      isActive: detailedStatus === "initializing",
      isCompleted: detailedStatus !== "initializing"
    },
    {
      id: "loading_model",
      label: "Loading building model",
      isActive: detailedStatus === "loading_model",
      isCompleted: false
    },
    {
      id: "running",
      label: "Running simulation engine",
      isActive: false,
      isCompleted: false
    },
    {
      id: "collecting",
      label: "Collecting energy data",
      isActive: false,
      isCompleted: false
    },
    {
      id: "analyzing",
      label: "AI analyzing performance",
      isActive: false,
      isCompleted: false
    },
    {
      id: "generating",
      label: "Generating optimization actions",
      isActive: false,
      isCompleted: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white select-none animate-fade-in">
      <div className="max-w-md w-full p-8 flex flex-col items-center space-y-8">
        
        {/* Top Cognitive Spinning Brain Logo */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="h-16 w-16 rounded-3xl bg-neutral-900 text-white flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl font-bold">▲</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">EcoLoop Simulation Lifecycle</h2>
            <p className="text-xs text-neutral-400 font-semibold font-mono">Initializing virtual building environment...</p>
          </div>
        </div>

        {/* Steps List */}
        <div className="w-full space-y-4 bg-neutral-50/50 border border-neutral-100 rounded-3xl p-6" style={{ borderRadius: 24 }}>
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                {step.isCompleted ? (
                  <div className="h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : step.isActive ? (
                  <div className="h-5 w-5 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="h-5 w-5 text-neutral-300 flex items-center justify-center">
                    <Circle className="h-3.5 w-3.5" />
                  </div>
                )}
                <span 
                  className={`text-xs font-semibold ${
                    step.isCompleted 
                      ? "text-neutral-500 line-through" 
                      : step.isActive 
                      ? "text-neutral-900 font-bold" 
                      : "text-neutral-300"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest">
                Step {idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Outer details */}
        <p className="text-[10px] text-neutral-400 font-medium text-center leading-relaxed max-w-[280px]">
          EnergyPlus engine coordinates zones thermodynamic load balance to seed the AI audit feedback loop.
        </p>

      </div>
    </div>
  );
}
