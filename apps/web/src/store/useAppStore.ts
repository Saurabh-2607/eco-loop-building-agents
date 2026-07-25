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
  aiReport: string;
  aiReportLoading: boolean;

  // Actions
  setSimStatus: (status: SimulationState["status"]) => void;
  setSpeedMultiplier: (speed: number) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  submitFeedback: (id: string, feedback: AgentDecision["feedbackStatus"]) => void;
  addLog: (log: Omit<SystemLog, "id">) => void;
  addMetricPoint: (point: SimulationMetric) => void;
  
  // Live Integrations API Actions
  connectWebSocket: () => void;
  fetchLatestSimulation: () => Promise<void>;
  startSimulation: (name: string) => Promise<void>;
  applyOverrides: (hvac: number, light: number) => Promise<void>;
  fetchHistoricalMetrics: (simId: string) => Promise<void>;
  triggerLiveOptimization: (simId?: string) => Promise<void>;
  triggerAILangGraphAnalysis: (simId: string) => Promise<void>;
  fetchAIDecisions: (simId: string) => Promise<void>;
  triggerMockOptimization: () => void;
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
  aiReport: "",
  aiReportLoading: false,

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

  submitFeedback: async (id, feedbackStatus) => {
    try {
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        service: "frontend",
        message: `Submitting feedback status [${feedbackStatus.toUpperCase()}] for decision ${id}...`
      });

      const res = await fetch(`${API_URL}/api/v1/optimization/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision_id: id, rating: feedbackStatus })
      });
      const payload = await res.json();

      if (payload.success) {
        set((state) => {
          const updatedDecisions = state.decisions.map((dec) => 
            dec.id === id ? { ...dec, feedbackStatus } : dec
          );
          return { decisions: updatedDecisions };
        });
        get().addLog({
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          service: "backend",
          message: `Feedback for decision ${id} successfully logged.`
        });
      }
    } catch (e) {
      const err = e as Error;
      console.error("Failed submitting feedback:", err);
      // Local fallback representation
      set((state) => {
        const updatedDecisions = state.decisions.map((dec) => 
          dec.id === id ? { ...dec, feedbackStatus } : dec
        );
        return { decisions: updatedDecisions };
      });
    }
  },

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
            message: "Simulation finished successfully. Querying parsed SQL metrics..."
          });
          // Fetch final database metrics
          const runId = get().simState.runId;
          if (runId) {
            get().fetchHistoricalMetrics(runId);
            get().triggerLiveOptimization(runId);
          }
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
        const runId = payload.data.id;
        set((state) => ({
          simState: {
            ...state.simState,
            runId: runId,
            status: payload.data.status,
            currentModel: payload.data.simulation_name
          }
        }));
        // Retrieve loaded metrics history and optimizations
        if (runId) {
          get().fetchHistoricalMetrics(runId);
          get().fetchAIDecisions(runId);
        }
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
            currentModel: payload.data.simulation_name,
            elapsedSeconds: 0
          }
        }));
      } else {
        throw new Error(payload.error?.message || "Internal server error");
      }
    } catch (e) {
      const err = e as Error;
      console.error(err);
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
    } catch (e) {
      const err = e as Error;
      console.error(err);
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        service: "frontend",
        message: `Overrides submission failed: ${e.message}`
      });
    }
  },

  // Fetch metrics history
  fetchHistoricalMetrics: async (simId: UUID) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/simulation/results/${simId}`);
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.data)) {
        const mappedMetrics: SimulationMetric[] = payload.data.map((m: {
          recorded_at: string;
          temperature: number;
          humidity: number;
          occupancy: number;
          hvac_load: number;
          lighting_load: number;
        }) => {
          const recDate = new Date(m.recorded_at);
          const hh = String(recDate.getHours()).padStart(2, "0");
          const mm = String(recDate.getMinutes()).padStart(2, "0");
          return {
            timestamp: `${hh}:${mm}`,
            indoorTemp: m.temperature,
            outdoorTemp: 26.5, // Outdoor temperature stub fallback
            relativeHumidity: m.humidity,
            occupancyCount: m.occupancy,
            pmv: 0.0,
            ppd: 0.0,
            hvacPower: m.hvac_load,
            lightingPower: m.lighting_load
          };
        });
        
        if (mappedMetrics.length > 0) {
          const latestPoint = mappedMetrics[mappedMetrics.length - 1];
          set({ 
            metrics: mappedMetrics,
            summary: {
              energy: Math.round(latestPoint.hvacPower + latestPoint.lightingPower),
              temperature: latestPoint.indoorTemp,
              occupancy: latestPoint.occupancyCount,
              savings: get().summary.savings
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed fetching historical metrics:", e);
    }
  },

  triggerMockOptimization: () => {
    set((state) => ({
      summary: {
        ...state.summary,
        savings: Math.min(
          state.summary.savings + 5,
          100
        )
      }
    }));

    get().addLog({
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO",
      service: "optimizer",
      message: "Mock optimization triggered successfully."
    });
  },

  // Trigger deterministic optimization pass
  triggerLiveOptimization: async (simId?: string) => {
    try {
      const activeId = simId || get().simState.runId;
      if (!activeId) return;

      const res = await fetch(`${API_URL}/api/v1/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_id: activeId })
      });
      const payload = await res.json();
      if (payload.success && payload.data) {
        set((state) => ({
          summary: {
            ...state.summary,
            savings: payload.data.estimated_savings_percent
          }
        }));
        get().addLog({
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          service: "optimizer",
          message: `Deterministic optimization pass complete. Saving percent target: ${payload.data.estimated_savings_percent}%`
        });
        await get().fetchAIDecisions(activeId);
      }
    } catch (e) {
      console.warn("Failed to trigger optimization rules engine:", e);
    }
  },

  // Trigger LangGraph AI Optimization Agent report
  triggerAILangGraphAnalysis: async (simId: string) => {
    try {
      set({ aiReportLoading: true });
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        service: "agent",
        message: "Triggering LangGraph Agent reasoning node flow..."
      });

      const res = await fetch(`${API_URL}/api/v1/ai/analyze/${simId}`, {
        method: "POST"
      });
      const payload = await res.json();
      if (payload.success && payload.data) {
        set({ 
          aiReport: payload.data.final_report,
          aiReportLoading: false 
        });
        get().addLog({
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          service: "agent",
          message: "LangGraph report generated successfully."
        });
        await get().fetchAIDecisions(simId);
      } else {
        throw new Error(payload.detail || "Agent workflow crash");
      }
    } catch (e) {
      const err = e as Error;
      console.error(err);
      set({ aiReportLoading: false });
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        service: "agent",
        message: `LangGraph agent execution failed: ${e.message}`
      });
    }
  },

  // Fetch logged decisions and AI reports
  fetchAIDecisions: async (simId: string) => {
    try {
      // 1. Fetch deterministic recommendations
      const recRes = await fetch(`${API_URL}/api/v1/recommendations/${simId}`);
      const recPayload = await recRes.json();
      
      // 2. Fetch LangGraph natural language report
      const repRes = await fetch(`${API_URL}/api/v1/ai/report/${simId}`);
      const repPayload = await repRes.json();

      let mappedDecisions: AgentDecision[] = [];
      if (recPayload.success && Array.isArray(recPayload.data?.recommendations)) {
        mappedDecisions = recPayload.data.recommendations.map((r: { category: string; recommendation: string }, idx: number) => ({
          id: `dec-${idx}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          hvacSetpoint: r.category === "HVAC" ? 24.0 : 22.0,
          lightingDim: r.category === "Lighting" ? 70 : 100,
          reason: r.recommendation,
          modelName: "Rule Engine",
          tokensConsumed: 0,
          feedbackStatus: "unrated"
        }));
      }

      set((state) => ({
        decisions: mappedDecisions.length > 0 ? mappedDecisions : state.decisions,
        aiReport: repPayload.success ? repPayload.data.final_report : state.aiReport
      }));
    } catch (e) {
      console.warn("Failed retrieving AI reports and decisions:", e);
    }
  }
}));
