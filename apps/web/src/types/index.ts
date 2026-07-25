export interface SimulationMetric {
  timestamp: string;
  indoorTemp: number;
  outdoorTemp: number;
  relativeHumidity: number;
  occupancyCount: number;
  pmv: number;
  ppd: number;
  hvacPower: number;
  lightingPower: number;
}

export interface AgentDecision {
  id: string;
  timestamp: string;
  hvacSetpoint: number;
  lightingDim: number;
  reason: string;
  modelName: string;
  tokensConsumed: number;
  feedbackStatus: "unrated" | "correct" | "incorrect";
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  service: string;
  message: string;
}

export interface SimulationState {
  runId: string;
  status: "idle" | "running" | "paused" | "finished" | "error";
  speedMultiplier: number;
  elapsedSeconds: number;
  currentModel: string;
  currentWeather: string;
}

export interface SystemSettings {
  apiUrl: string;
  wsUrl: string;
  ollamaHost: string;
  modelName: string;
  minCoolingSetpoint: number;
  maxCoolingSetpoint: number;
  minLightDim: number;
  maxLightDim: number;
}
