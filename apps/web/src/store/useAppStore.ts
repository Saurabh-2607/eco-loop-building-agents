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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

interface AppStore {
  // States
  simState: SimulationState;
  settings: SystemSettings;
  metrics: SimulationMetric[];
  decisions: AgentDecision[];
  logs: SystemLog[];
  summary: typeof mockDashboardSummary;
  wsConnected: boolean;

  // Actions
  setSimStatus: (status: SimulationState["status"]) => void;
  setSpeedMultiplier: (speed: number) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  submitFeedback: (id: string, feedback: AgentDecision["feedbackStatus"]) => void;
  addLog: (log: Omit<SystemLog, "id">) => void;
  addMetricPoint: (point: SimulationMetric) => void;
  triggerMockOptimization: () => void;

  // Live Integrations API Actions
  connectWebSocket: () => void;
  fetchLatestSimulation: () => Promise<void>;
  startSimulation: (name: string) => Promise<void>;
  applyOverrides: (hvac: number, light: number) => Promise<void>;
}

let socket: WebSocket | null = null;

export const useAppStore = create<AppStore>((set, get) => ({
  simState: mockSimulationState,
  settings: {
    ...mockSystemSettings,
    apiUrl: API_URL,
    wsUrl: WS_URL,
  },
  metrics: mockHistoricalMetrics,
  decisions: mockAgentDecisions,
  logs: mockSystemLogs,
  summary: mockDashboardSummary,
  wsConnected: false,

  setSimStatus: (status) => set((state) => {
    const updatedSim = { ...state.simState, status };
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO",
      service: "simulator",
      message: `Simulation status changed manually to: ${status.toUpperCase()}`
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
    const newMetrics = [...state.metrics.slice(1), point];
    return { 
      metrics: newMetrics,
      summary: {
        energy: Math.round(point.hvacPower + point.lightingPower),
        temperature: parseFloat(point.indoorTemp.toFixed(1)),
        occupancy: point.occupancyCount,
        savings: state.summary.savings
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
  }),

  // Establish WebSocket telemetry pipe
  connectWebSocket: () => {
    if (typeof window === "undefined" || socket) return;

    console.log(`Connecting to WebSocket: ${WS_URL}`);
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("WebSocket connection established with backend.");
      set({ wsConnected: true });
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        service: "frontend",
        message: "WebSocket connection established with API server."
      });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket event:", data);

        if (data.event === "SIMULATION_STEP") {
          const payload = data.payload;
          const metric: SimulationMetric = {
            timestamp: payload.timestamp || new Date().toLocaleTimeString(),
            indoorTemp: payload.indoor_temp || 22.0,
            outdoorTemp: payload.outdoor_temp || 28.5,
            relativeHumidity: payload.humidity || 48.0,
            occupancyCount: payload.occupancy || 0,
            pmv: payload.pmv || 0.0,
            ppd: payload.ppd || 0.0,
            hvacPower: payload.hvac_power_kw || 0.0,
            lightingPower: payload.lighting_power_kw || 0.0
          };
          get().addMetricPoint(metric);
        } else if (data.event === "SIMULATION_PROGRESS") {
          const payload = data.payload;
          set((state) => ({
            simState: {
              ...state.simState,
              status: payload.status || state.simState.status,
              elapsedSeconds: state.simState.elapsedSeconds + 1
            }
          }));
          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO",
            service: "simulator",
            message: `Simulation execution progress: ${payload.progress}% (${payload.status})`
          });
        } else if (data.event === "SIMULATION_COMPLETE") {
          set((state) => ({
            simState: {
              ...state.simState,
              status: "finished"
            }
          }));
          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO",
            service: "simulator",
            message: "Simulation finished successfully."
          });
        }
      } catch (err) {
        console.error("Error parsing WS packet:", err);
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket connection terminated.");
      set({ wsConnected: false });
      socket = null;
      // Reconnect loop after 5 seconds
      setTimeout(() => get().connectWebSocket(), 5000);
    };
  },

  // Query latest run status
  fetchLatestSimulation: async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/simulation/latest`);
      const payload = await res.json();
      if (payload.success && payload.data) {
        set((state) => ({
          simState: {
            ...state.simState,
            runId: payload.data.id,
            status: payload.data.status,
            currentModel: payload.data.simulation_name
          }
        }));
      }
    } catch (e) {
      console.warn("Failed fetching latest simulation configuration:", e);
    }
  },

  // Trigger simulation starting REST API
  startSimulation: async (name: string) => {
    try {
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        service: "frontend",
        message: `Triggering run request for simulation: "${name}"`
      });

      const res = await fetch(`${API_URL}/api/v1/simulation/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_name: name })
      });
      const payload = await res.json();

      if (payload.success && payload.data) {
        set((state) => ({
          simState: {
            ...state.simState,
            runId: payload.data.id,
            status: payload.data.status,
            currentModel: payload.data.simulation_name
          }
        }));
      } else {
        throw new Error(payload.error?.message || "Internal server error");
      }
    } catch (e: any) {
      console.error(e);
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        service: "frontend",
        message: `Failed to trigger simulation: ${e.message}`
      });
    }
  },

  // Apply actuation overrides overrides
  applyOverrides: async (hvacSetpoint: number, lightingDim: number) => {
    try {
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "WARNING",
        service: "frontend",
        message: `Submitting control override HVAC -> ${hvacSetpoint}°C, Lights -> ${lightingDim}%`
      });

      const res = await fetch(`${API_URL}/api/v1/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hvac_setpoint: hvacSetpoint, lighting_dim: lightingDim })
      });
      const payload = await res.json();

      if (payload.success) {
        get().addLog({
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          service: "backend",
          message: "Control overrides acknowledged and applied by service repository."
        });
      } else {
        throw new Error(payload.error?.message || "Actuators error");
      }
    } catch (e: any) {
      console.error(e);
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        service: "frontend",
        message: `Overrides submission failed: ${e.message}`
      });
    }
  }
}));
