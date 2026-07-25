import { SimulationMetric, AgentDecision, SystemLog, SimulationState, SystemSettings } from "@/types";

// Static KPIs for Dashboard summary
export const mockDashboardSummary = {
  energy: 184,        // kW average power
  temperature: 22.8,   // °C current indoor
  occupancy: 67,       // active occupants count
  savings: 14.5,       // % savings versus baseline
};

// 24 hours of simulated historical time series data (e.g., in 2-hour increments)
export const mockHistoricalMetrics: SimulationMetric[] = [
  { timestamp: "00:00", indoorTemp: 21.5, outdoorTemp: 16.2, relativeHumidity: 62, occupancyCount: 0, pmv: -0.4, ppd: 8, hvacPower: 45, lightingPower: 5 },
  { timestamp: "02:00", indoorTemp: 21.0, outdoorTemp: 15.0, relativeHumidity: 65, occupancyCount: 0, pmv: -0.6, ppd: 12, hvacPower: 40, lightingPower: 5 },
  { timestamp: "04:00", indoorTemp: 20.8, outdoorTemp: 14.5, relativeHumidity: 64, occupancyCount: 0, pmv: -0.7, ppd: 15, hvacPower: 38, lightingPower: 5 },
  { timestamp: "06:00", indoorTemp: 21.2, outdoorTemp: 15.8, relativeHumidity: 60, occupancyCount: 12, pmv: -0.5, ppd: 10, hvacPower: 42, lightingPower: 12 },
  { timestamp: "08:00", indoorTemp: 22.1, outdoorTemp: 18.5, relativeHumidity: 55, occupancyCount: 45, pmv: -0.2, ppd: 6, hvacPower: 75, lightingPower: 45 },
  { timestamp: "10:00", indoorTemp: 22.6, outdoorTemp: 22.1, relativeHumidity: 50, occupancyCount: 82, pmv: 0.1, ppd: 5, hvacPower: 110, lightingPower: 80 },
  { timestamp: "12:00", indoorTemp: 23.0, outdoorTemp: 25.4, relativeHumidity: 48, occupancyCount: 95, pmv: 0.2, ppd: 6, hvacPower: 135, lightingPower: 92 },
  { timestamp: "14:00", indoorTemp: 23.2, outdoorTemp: 27.2, relativeHumidity: 45, occupancyCount: 88, pmv: 0.3, ppd: 7, hvacPower: 140, lightingPower: 88 },
  { timestamp: "16:00", indoorTemp: 22.8, outdoorTemp: 26.5, relativeHumidity: 47, occupancyCount: 75, pmv: 0.1, ppd: 5, hvacPower: 125, lightingPower: 82 },
  { timestamp: "18:00", indoorTemp: 22.5, outdoorTemp: 24.1, relativeHumidity: 52, occupancyCount: 50, pmv: 0.0, ppd: 5, hvacPower: 98, lightingPower: 60 },
  { timestamp: "20:00", indoorTemp: 22.0, outdoorTemp: 21.0, relativeHumidity: 56, occupancyCount: 22, pmv: -0.2, ppd: 6, hvacPower: 65, lightingPower: 25 },
  { timestamp: "22:00", indoorTemp: 21.8, outdoorTemp: 18.5, relativeHumidity: 60, occupancyCount: 4, pmv: -0.3, ppd: 7, hvacPower: 50, lightingPower: 10 }
];

// Mock agent reasoning decisions timeline feed
export const mockAgentDecisions: AgentDecision[] = [
  {
    id: "dec-1",
    timestamp: "2026-07-25T17:58:00Z",
    hvacSetpoint: 23.0,
    lightingDim: 75,
    reason: "Occupancy is low in Zone A. Increased cooling setpoint to 23°C and dimmed lights to 75% to conserve energy while keeping comfort index inside safety limits.",
    modelName: "Qwen3 (8B)",
    tokensConsumed: 420,
    feedbackStatus: "correct"
  },
  {
    id: "dec-2",
    timestamp: "2026-07-25T18:13:00Z",
    hvacSetpoint: 22.5,
    lightingDim: 85,
    reason: "Occupancy load increased to 45 people. Lowered cooling setpoint to 22.5°C to offset internal metabolic heat gain and adjusted lighting to 85% for working comfort.",
    modelName: "Qwen3 (8B)",
    tokensConsumed: 485,
    feedbackStatus: "unrated"
  },
  {
    id: "dec-3",
    timestamp: "2026-07-25T18:28:00Z",
    hvacSetpoint: 23.5,
    lightingDim: 50,
    reason: "Peak price utility tariff window detected. Raised cooling setpoint by 1.0°C and set lights to eco-dim (50%) in transit corridors to shed 18% peak load demand.",
    modelName: "Qwen3 (8B)",
    tokensConsumed: 512,
    feedbackStatus: "unrated"
  }
];

// System activity logger feed
export const mockSystemLogs: SystemLog[] = [
  { id: "log-1", timestamp: "18:20:12", level: "INFO", service: "backend", message: "API server listening on port 8000" },
  { id: "log-2", timestamp: "18:20:15", level: "INFO", service: "database", message: "Database connection initialized successfully" },
  { id: "log-3", timestamp: "18:20:20", level: "INFO", service: "simulator", message: "EnergyPlus API loaded, loading building model small_office.idf" },
  { id: "log-4", timestamp: "18:20:22", level: "WARNING", service: "simulator", message: "Weather data EPW missing wind direction index, using fallback interpolations" },
  { id: "log-5", timestamp: "18:20:25", level: "INFO", service: "agent", message: "LangGraph runtime compiled decision graph. Ollama connection verified." },
  { id: "log-6", timestamp: "18:20:30", level: "INFO", service: "simulator", message: "Simulation started with speed multiplier 10x" },
  { id: "log-7", timestamp: "18:28:00", level: "INFO", service: "agent", message: "Optimization loop triggered. Input PMV = 0.42, Load Period = PEAK" },
  { id: "log-8", timestamp: "18:28:03", level: "INFO", service: "agent", message: "AI recommendation processed: HVAC setpoint override -> 23.5°C" }
];

// Initial simulation state values
export const mockSimulationState: SimulationState = {
  runId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  status: "running",
  speedMultiplier: 10,
  elapsedSeconds: 66200,
  currentModel: "small_office.idf",
  currentWeather: "USA_IL_Chicago-OHare.Intl.AP.725300_TMY3.epw"
};

// Initial system configurations settings
export const mockSystemSettings: SystemSettings = {
  apiUrl: "http://localhost:8000",
  wsUrl: "ws://localhost:8000/ws",
  ollamaHost: "http://ollama:11434",
  modelName: "qwen3:8b",
  minCoolingSetpoint: 20.0,
  maxCoolingSetpoint: 26.0,
  minLightDim: 20,
  maxLightDim: 100
};
