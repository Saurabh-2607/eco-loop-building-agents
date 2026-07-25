import { create } from "zustand";
import { SimulationMetric, AgentDecision, SystemLog, SimulationState, SystemSettings } from "@/types";
import { 
  mockSimulationState, 
  mockSystemSettings, 
  mockHistoricalMetrics, 
  mockAgentDecisions, 
  mockSystemLogs,
  mockDashboardSummary
} from "@/lib/mock-data";

interface AppStore {
  // States
  simState: SimulationState;
  settings: SystemSettings;
  metrics: SimulationMetric[];
  decisions: AgentDecision[];
  logs: SystemLog[];
  summary: typeof mockDashboardSummary;

  // Actions
  setSimStatus: (status: SimulationState["status"]) => void;
  setSpeedMultiplier: (speed: number) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  submitFeedback: (id: string, feedback: AgentDecision["feedbackStatus"]) => void;
  addLog: (log: Omit<SystemLog, "id">) => void;
  addMetricPoint: (point: SimulationMetric) => void;
  triggerMockOptimization: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  simState: mockSimulationState,
  settings: mockSystemSettings,
  metrics: mockHistoricalMetrics,
  decisions: mockAgentDecisions,
  logs: mockSystemLogs,
  summary: mockDashboardSummary,

  setSimStatus: (status) => set((state) => {
    const updatedSim = { ...state.simState, status };
    const logMsg = `Simulation status changed to: ${status.toUpperCase()}`;
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO",
      service: "simulator",
      message: logMsg
    };
    return { 
      simState: updatedSim,
      logs: [newLog, ...state.logs]
    };
  }),

  setSpeedMultiplier: (speedMultiplier) => set((state) => {
    const updatedSim = { ...state.simState, speedMultiplier };
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO",
      service: "simulator",
      message: `Speed multiplier adjusted to ${speedMultiplier}x`
    };
    return { 
      simState: updatedSim,
      logs: [newLog, ...state.logs]
    };
  }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  submitFeedback: (id, feedbackStatus) => set((state) => {
    const updatedDecisions = state.decisions.map((dec) => 
      dec.id === id ? { ...dec, feedbackStatus } : dec
    );
    const targetDec = state.decisions.find(d => d.id === id);
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO",
      service: "backend",
      message: `Operator submitted feedback [${feedbackStatus.toUpperCase()}] for decision ${id}`
    };
    return { 
      decisions: updatedDecisions,
      logs: [newLog, ...state.logs]
    };
  }),

  addLog: (log) => set((state) => ({
    logs: [{ ...log, id: `log-${Date.now()}` }, ...state.logs]
  })),

  addMetricPoint: (point) => set((state) => {
    // Retain only the last 15 metric points for visual charts spacing
    const newMetrics = [...state.metrics.slice(1), point];
    return { 
      metrics: newMetrics,
      summary: {
        energy: Math.round(point.hvacPower + point.lightingPower),
        temperature: parseFloat(point.indoorTemp.toFixed(1)),
        occupancy: point.occupancyCount,
        savings: state.summary.savings // retain current savings
      }
    };
  }),

  triggerMockOptimization: () => set((state) => {
    const nextHvac = 22.0 + Math.random() * 2;
    const nextLight = Math.random() > 0.5 ? 70 : 80;
    const newDecision: AgentDecision = {
      id: `dec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      hvacSetpoint: parseFloat(nextHvac.toFixed(1)),
      lightingDim: nextLight,
      reason: `Optimization triggered manually by operator. Stabilizing indoor thermal index (PMV: ${state.metrics[state.metrics.length - 1]?.pmv.toFixed(2) || "0.0"}) at minimum power output profile.`,
      modelName: state.settings.modelName,
      tokensConsumed: Math.floor(350 + Math.random() * 200),
      feedbackStatus: "unrated"
    };

    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO",
      service: "agent",
      message: `Manual optimization complete: Target HVAC setpoint -> ${newDecision.hvacSetpoint}°C, Lights -> ${newDecision.lightingDim}%`
    };

    return {
      decisions: [newDecision, ...state.decisions],
      logs: [newLog, ...state.logs]
    };
  })
}));
