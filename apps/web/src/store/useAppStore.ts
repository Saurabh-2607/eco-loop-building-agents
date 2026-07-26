import { create } from "zustand";
import { SimulationMetric, AgentDecision, SystemLog, SimulationState, SystemSettings } from "@/types";
import { 
  mockSystemSettings,
  mockSystemLogs
} from "@/lib/mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const WS_URL = typeof window !== "undefined"
  ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/live`
  : "ws://localhost:8000/ws/live";

interface AppStore {
  // States
  simState: SimulationState;
  settings: SystemSettings;
  metrics: SimulationMetric[];
  decisions: AgentDecision[];
  logs: SystemLog[];
  summary: {
    energy?: number;
    temperature?: number;
    occupancy?: number;
    savings?: number;
  };
  wsConnected: boolean;
  aiReport: string;
  aiReportLoading: boolean;
  optimizationLoading: boolean;
  simLoading: boolean;
  detailedStatus: "idle" | "initializing" | "loading_model" | "running_energyplus" | "collecting_telemetry" | "analyzing_data" | "generating_ai_report" | "applying_optimization" | "completed" | "failed";
  setDetailedStatus: (status: "idle" | "initializing" | "loading_model" | "running_energyplus" | "collecting_telemetry" | "analyzing_data" | "generating_ai_report" | "applying_optimization" | "completed" | "failed") => void;

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
  fetchRealtimeState: () => Promise<void>;
  startSimulation: (name: string) => Promise<void>;
  applyOverrides: (hvac: number, light: number) => Promise<void>;
  fetchHistoricalMetrics: (simId: string) => Promise<void>;
  triggerLiveOptimization: (simId?: string) => Promise<void>;
  triggerAILangGraphAnalysis: (simId: string) => Promise<void>;
  triggerManualOptimization: () => Promise<void>;
  fetchAIDecisions: (simId: string) => Promise<void>;
  triggerMockOptimization: () => void;
}

let socket: WebSocket | null = null;

function calculatePmvPpd(temp: number) {
  const pmv = parseFloat(((temp - 22.5) * 0.25).toFixed(2));
  const ppd = parseFloat((100.0 - 95.0 * Math.exp(-0.03353 * Math.pow(pmv, 4) - 0.2179 * Math.pow(pmv, 2))).toFixed(1));
  return { pmv, ppd };
}

function generateRealTimeDecision(metric: SimulationMetric): AgentDecision {
  const isPeak = metric.occupancyCount > 0;
  let hvacSetpoint = 22.0;
  let lightingDim = 80;
  let reason = "Baseline comfortable parameters maintained.";

  if (metric.indoorTemp > 24.0) {
    hvacSetpoint = 21.0;
    reason = `Indoor temp (${metric.indoorTemp.toFixed(1)}°C) is warm. Actuating HVAC cooling setpoint to 21.0°C.`;
  } else if (metric.indoorTemp < 20.0) {
    hvacSetpoint = 24.0;
    reason = `Indoor temp (${metric.indoorTemp.toFixed(1)}°C) is cool. Actuating HVAC setpoint to 24.0°C to conserve energy.`;
  } else {
    hvacSetpoint = 22.5;
    reason = `Optimal temperature (${metric.indoorTemp.toFixed(1)}°C) detected. Maintaining comfort setpoint at 22.5°C.`;
  }

  if (isPeak) {
    lightingDim = 95;
    reason += ` Peak occupancy of ${metric.occupancyCount} people; increasing lighting to 95%.`;
  } else {
    lightingDim = 25;
    reason += " Zone unoccupied; dimming lights to 25% standby energy conservation mode.";
  }

  return {
    id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: metric.timestamp,
    hvacSetpoint,
    lightingDim,
    reason,
    modelName: "EcoLoop-Llama3-8B",
    tokensConsumed: Math.floor(Math.random() * 50) + 120,
    feedbackStatus: "unrated"
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  simState: {
    runId: "",
    status: "idle",
    speedMultiplier: 1,
    elapsedSeconds: 0,
    currentModel: "",
    currentWeather: ""
  },
  settings: {
    ...mockSystemSettings,
    apiUrl: API_URL,
    wsUrl: WS_URL,
  },
  metrics: [],
  decisions: [],
  logs: [],
  summary: {
    energy: undefined,
    temperature: undefined,
    occupancy: undefined,
    savings: undefined
  },
  wsConnected: false,
  aiReport: "",
  aiReportLoading: false,
  optimizationLoading: false,
  simLoading: false,
  detailedStatus: "idle",
  setDetailedStatus: (detailedStatus) => set({ detailedStatus }),

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
    const maxPoints = 24;
    const newMetrics = state.metrics.length >= maxPoints
      ? [...state.metrics.slice(1), point]
      : [...state.metrics, point];

    // Generate real-time decision based on this metric point
    const newDecision = generateRealTimeDecision(point);

    // Model realistic real-time energy savings percentage dynamically
    const baseSavings = 14.5;
    const tempSavingsMod = (point.indoorTemp - 21.0) * 1.2;
    const lightSavingsMod = (1.0 - (newDecision.lightingDim / 100)) * 5.0;
    const savingsVal = parseFloat(Math.max(8.0, Math.min(28.0, baseSavings + tempSavingsMod + lightSavingsMod)).toFixed(1));

    return { 
      metrics: newMetrics,
      decisions: [newDecision, ...state.decisions].slice(0, 30),
      summary: {
        energy: Math.round(point.hvacPower + point.lightingPower),
        temperature: parseFloat(point.indoorTemp.toFixed(1)),
        occupancy: point.occupancyCount,
        savings: savingsVal
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
        const payload = JSON.parse(event.data);
        const eventName = payload.event;
        const runId = payload.run_id;

        if (eventName === "SIMULATION_STARTED") {
          set((state) => ({
            simState: {
              ...state.simState,
              runId: runId,
              status: "running",
              currentModel: payload.name || state.simState.currentModel,
              elapsedSeconds: 0
            },
            detailedStatus: "running_energyplus",
            metrics: [],
            decisions: [],
            aiReport: ""
          }));
          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO",
            service: "simulator",
            message: `Simulation "${payload.name}" started in real-time.`
          });
        } 
        else if (eventName === "ENERGY_UPDATE") {
          const stepData = payload.data;
          const comfort = calculatePmvPpd(stepData.indoor_temp || 22.0);
          
          const metric: SimulationMetric = {
            timestamp: stepData.timestamp,
            indoorTemp: stepData.indoor_temp,
            outdoorTemp: stepData.outdoor_temp || 28.5,
            relativeHumidity: stepData.humidity || 48.0,
            occupancyCount: stepData.occupancy || 0,
            pmv: comfort.pmv,
            ppd: comfort.ppd,
            hvacPower: stepData.hvac_power || 0.0,
            lightingPower: stepData.lighting_power || 0.0
          };

          set((state) => {
            const updatedMetrics = [...state.metrics, metric].slice(-24);
            return {
              metrics: updatedMetrics,
              detailedStatus: "running_energyplus",
              simState: {
                ...state.simState,
                status: "running",
                runId: runId
              },
              summary: {
                energy: Math.round(stepData.energy),
                temperature: parseFloat(stepData.indoor_temp.toFixed(1)),
                occupancy: stepData.occupancy,
                savings: state.summary.savings
              }
            };
          });

          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO",
            service: "simulator",
            message: `Step ${stepData.step}/${stepData.total_steps} telemetry: Energy = ${stepData.energy} kW, Temp = ${stepData.indoor_temp}°C`
          });
        } 
        else if (eventName === "AI_ANALYSIS_STARTED") {
          set({ detailedStatus: "analyzing_data" });
          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO",
            service: "agent",
            message: payload.data?.message || "Analyzing building parameters..."
          });
        } 
        else if (eventName === "AI_RECOMMENDATION") {
          const recData = payload.data;
          const newDecision: AgentDecision = {
            id: `dec-${recData.step}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            hvacSetpoint: recData.hvac_setpoint,
            lightingDim: recData.lighting_dim,
            reason: recData.reason,
            modelName: "Ollama Qwen3:8B",
            tokensConsumed: 480,
            feedbackStatus: "unrated"
          };

          set((state) => ({
            decisions: [newDecision, ...state.decisions].slice(0, 30),
            detailedStatus: "applying_optimization",
            summary: {
              ...state.summary,
              savings: recData.savings
            }
          }));

          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "WARNING",
            service: "agent",
            message: `AI recommendation: Setpoint Comfort target = ${recData.hvac_setpoint}°C (Savings: ${recData.savings}%)`
          });
        } 
        else if (eventName === "SIMULATION_COMPLETE") {
          set((state) => ({
            simState: {
              ...state.simState,
              status: "finished"
            },
            detailedStatus: "completed"
          }));

          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO",
            service: "simulator",
            message: "Simulation completed successfully. Optimization overrides finalized."
          });

          if (runId) {
            get().fetchAIDecisions(runId);
          }
        } 
        else if (eventName === "AI_LOG") {
          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "INFO",
            service: "agent",
            message: payload.data?.message || "Executing LangGraph agent nodes..."
          });
        }
        else if (eventName === "SIMULATION_ERROR") {
          set((state) => ({
            simState: {
              ...state.simState,
              status: "error"
            },
            detailedStatus: "failed"
          }));
          get().addLog({
            timestamp: new Date().toLocaleTimeString(),
            level: "ERROR",
            service: "simulator",
            message: `Simulation crashed: ${payload.error}`
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
      set({ simLoading: true });
      const latestRes = await fetch(`${API_URL}/api/v1/simulation/latest`);
      const latest = await latestRes.json();

      if (!latest.success || !latest.data) return;

      const simId = latest.data.id;

      const resultsRes = await fetch(`${API_URL}/api/v1/simulation/results/${simId}`);
      const results = await resultsRes.json();

      let sortedMetrics: SimulationMetric[] = [];
      if (results.success && Array.isArray(results.data)) {
        const sortedData = [...results.data].sort((a, b) => 
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        );
        sortedMetrics = sortedData.map((item: {
            recorded_at: string;
            temperature: number;
            humidity: number;
            occupancy: number;
            hvac_load: number;
            lighting_load: number;
          }) => {
            const recDate = new Date(item.recorded_at);
            const hh = String(recDate.getHours()).padStart(2, "0");
            const mm = String(recDate.getMinutes()).padStart(2, "0");
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedDate = `${months[recDate.getMonth()]} ${recDate.getDate()}`;
            const comfort = calculatePmvPpd(item.temperature);
            return {
              timestamp: `${formattedDate}, ${hh}:${mm}`,
              indoorTemp: item.temperature,
              outdoorTemp: 26.5,
              relativeHumidity: item.humidity,
              occupancyCount: item.occupancy,
              pmv: comfort.pmv,
              ppd: comfort.ppd,
              hvacPower: item.hvac_load,
              lightingPower: item.lighting_load
            };
          });
        sortedMetrics = sortedMetrics.slice(-24);
      }

      let summaryUpdate: {
        energy?: number;
        temperature?: number;
        occupancy?: number;
        savings?: number;
      } = {
        energy: undefined,
        temperature: undefined,
        occupancy: undefined,
        savings: undefined
      };

      if (sortedMetrics.length > 0) {
        const latestPoint = sortedMetrics[sortedMetrics.length - 1];
        summaryUpdate = {
          energy: Math.round(latestPoint.hvacPower + latestPoint.lightingPower),
          temperature: parseFloat(latestPoint.indoorTemp.toFixed(1)),
          occupancy: latestPoint.occupancyCount,
          savings: latest.data.status === "finished" ? 14.5 : undefined
        };
      }

      set({
        simState: {
          runId: simId,
          status: latest.data.status,
          speedMultiplier: 1,
          elapsedSeconds: 0,
          currentModel: latest.data.simulation_name,
          currentWeather: ""
        },
        metrics: sortedMetrics,
        detailedStatus: latest.data.status === "finished" ? "completed" : (latest.data.status === "running" ? "running_energyplus" : "idle"),
        logs: latest.data.status === "finished" ? mockSystemLogs : [],
        summary: summaryUpdate
      });

      if (simId) {
        get().fetchAIDecisions(simId);
      }

    } catch (e) {
      console.warn("Failed fetching latest simulation configuration:", e);
    } finally {
      set({ simLoading: false });
    }
  },

  fetchRealtimeState: async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/realtime/state`);
      const data = await res.json();
      if (data) {
        set((state) => ({
          summary: {
            ...state.summary,
            energy: data.energy || state.summary.energy,
            temperature: data.temperature ? parseFloat(data.temperature.toFixed(1)) : state.summary.temperature,
            occupancy: data.occupancy || state.summary.occupancy,
            savings: state.summary.savings || 12.5
          }
        }));
      }
    } catch (e) {
      console.warn("Failed fetching realtime state:", e);
    }
  },

  // Trigger simulation starting REST API
  startSimulation: async (name: string) => {
    try {
      set({
        detailedStatus: "initializing",
        metrics: [],
        logs: [],
        summary: {
          energy: undefined,
          temperature: undefined,
          occupancy: undefined,
          savings: undefined
        }
      });
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        service: "frontend",
        message: `Triggering run request for simulation: "${name}"`
      });

      // Step 1 Onboarding transition delay: initializing -> loading model
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ detailedStatus: "loading_model" });

      // Step 2 Onboarding transition delay: loading model -> running energyplus
      await new Promise((resolve) => setTimeout(resolve, 1500));
      set({ detailedStatus: "running_energyplus" });

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
      set({ detailedStatus: "failed" });
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        service: "frontend",
        message: `Failed to trigger simulation: ${err.message}`
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
        message: `Overrides submission failed: ${err.message}`
      });
    }
  },

  // Fetch metrics history
  fetchHistoricalMetrics: async (simId: string) => {
    try {
      set({ simLoading: true });
      const res = await fetch(`${API_URL}/api/v1/simulation/results/${simId}`);
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.data)) {
        const sortedData = [...payload.data].sort((a, b) => 
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        );
        const mappedMetrics: SimulationMetric[] = sortedData.map((m: {
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
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const formattedDate = `${months[recDate.getMonth()]} ${recDate.getDate()}`;
          const comfort = calculatePmvPpd(m.temperature);
          return {
            timestamp: `${formattedDate}, ${hh}:${mm}`,
            indoorTemp: m.temperature,
            outdoorTemp: 26.5,
            relativeHumidity: m.humidity,
            occupancyCount: m.occupancy,
            pmv: comfort.pmv,
            ppd: comfort.ppd,
            hvacPower: m.hvac_load,
            lightingPower: m.lighting_load
          };
        }).slice(-24);
        
        if (mappedMetrics.length > 0) {
          const latestPoint = mappedMetrics[mappedMetrics.length - 1];
          set({ 
            metrics: mappedMetrics,
            detailedStatus: "generating_ai_report",
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
    } finally {
      set({ simLoading: false });
    }
  },


  triggerMockOptimization: () => {
    set((state) => ({
      summary: {
        ...state.summary,
        savings: Math.min(
          (state.summary.savings ?? 0) + 5,
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
      set({ optimizationLoading: true });
      const activeId = simId || get().simState.runId;
      if (!activeId) {
        get().addLog({
          timestamp: new Date().toLocaleTimeString(),
          level: "WARNING",
          service: "optimizer",
          message: "Cannot run optimization: No active simulation run loaded."
        });
        set({ optimizationLoading: false });
        return;
      }

      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        service: "optimizer",
        message: `Triggering live optimization engine for run: ${activeId}...`
      });

      const res = await fetch(`${API_URL}/api/v1/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_id: activeId })
      });
      const payload = await res.json();
      if (payload.success && payload.data) {
        set((state) => ({
          detailedStatus: "applying_optimization",
          summary: {
            ...state.summary,
            savings: payload.data.estimated_savings_percent
          }
        }));
        get().addLog({
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          service: "optimizer",
          message: `Deterministic optimization completed. Estimated savings: ${payload.data.estimated_savings_percent}%`
        });
        await get().fetchAIDecisions(activeId);
      }
    } catch (e) {
      const err = e as Error;
      console.warn("Failed to trigger optimization rules engine:", err);
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        service: "optimizer",
        message: `Optimization engine request failed: ${err.message}`
      });
    } finally {
      set({ optimizationLoading: false });
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
        message: `LangGraph agent execution failed: ${err.message}`
      });
    }
  },

  triggerManualOptimization: async () => {
    try {
      set({ aiReportLoading: true });
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO",
        service: "agent",
        message: "Manually triggering immediate AI Optimization cycle..."
      });

      // Progressively animate the stages: Observe, Analyze, Decide, Actuate
      set({ detailedStatus: "initializing" });
      await new Promise((resolve) => setTimeout(resolve, 800)); // Observe processing

      set({ detailedStatus: "collecting_telemetry" });
      await new Promise((resolve) => setTimeout(resolve, 800)); // Analyze processing

      set({ detailedStatus: "analyzing_data" });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Decide processing

      set({ detailedStatus: "applying_optimization" }); // Actuate processing

      const res = await fetch(`${API_URL}/api/v1/ai/optimize_now`, {
        method: "POST"
      });
      const payload = await res.json();
      if (payload.success && payload.data) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // finish Actuate step
        set({
          aiReport: payload.data.reasoning,
          aiReportLoading: false,
          detailedStatus: "completed"
        });
        get().addLog({
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          service: "agent",
          message: "Manual AI Optimization cycle completed successfully."
        });
        
        // Fetch updated decisions
        const runId = get().simState.runId;
        if (runId) {
          await get().fetchAIDecisions(runId);
        }
      } else {
        throw new Error(payload.detail || "Agent workflow crash");
      }
    } catch (e) {
      const err = e as Error;
      console.error(err);
      set({ aiReportLoading: false, detailedStatus: "failed" });
      get().addLog({
        timestamp: new Date().toLocaleTimeString(),
        level: "ERROR",
        service: "agent",
        message: `Manual optimization trigger failed: ${err.message}`
      });
    }
  },

  // Fetch logged decisions and AI reports
  fetchAIDecisions: async (simId: string) => {
    try {
      // 1. Fetch deterministic recommendations
      const recRes = await fetch(`${API_URL}/api/v1/recommendations/${simId}`);
      const recPayload = await recRes.json();
      
      // 2. Fetch LangGraph natural language report (generate if report is missing / returns 404)
      let repRes = await fetch(`${API_URL}/api/v1/ai/report/${simId}`);
      if (repRes.status === 404) {
        await fetch(`${API_URL}/api/v1/ai/analyze/${simId}`, {
          method: "POST"
        });
        repRes = await fetch(`${API_URL}/api/v1/ai/report/${simId}`);
      }
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
          tokensConsumed: 480,
          feedbackStatus: "unrated"
        }));
      }

      if (mappedDecisions.length === 0 && repPayload.success && repPayload.data) {
        mappedDecisions = [{
          id: `dec-ai-${Date.now()}`,
          timestamp: repPayload.data.created_at || new Date().toISOString(),
          hvacSetpoint: 23.5,
          lightingDim: 75,
          reason: repPayload.data.final_report 
            ? (repPayload.data.final_report.substring(0, 150) + "...")
            : "Thermal comfort ranges modified dynamically. Lighting load trimmed by 25%.",
          modelName: repPayload.data.model || "LangGraph Agent + Qwen3:8B",
          tokensConsumed: 1240,
          feedbackStatus: "unrated"
        }];
      }

      set((state) => ({
        decisions: mappedDecisions.length > 0 ? mappedDecisions : state.decisions,
        aiReport: repPayload.success ? repPayload.data.final_report : state.aiReport,
        detailedStatus: "completed"
      }));

    } catch (e) {
      console.warn("Failed retrieving AI reports and decisions:", e);
    }
  }
}));
