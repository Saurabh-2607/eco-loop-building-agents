# API Specification

This document defines the HTTP REST and WebSocket API specifications exposed by the FastAPI backend server.

---

## Endpoint Summary

| Endpoint | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | GET | None | Checks database, Ollama, and simulator availability. |
| `/api/metrics` | GET | Operator | Retrieves current real-time building state metrics. |
| `/api/history` | GET | Operator | Fetches historical aggregated metrics over a date range. |
| `/api/optimize` | POST | Operator | Force triggers a manual optimization reasoning pass. |
| `/api/control` | POST | Operator | Submits direct override settings bypassing the agent. |
| `/api/simulation` | GET | Operator | Retrieves active simulator state (run status, speed). |
| `/ws` | GET (WS) | Operator | Establishes websocket connection for live telemetry. |

---

## Endpoint Details

### 1. GET `/api/health`
Checks backend and service dependencies states.

* **Request**:
  - Headers: None
  - Body: None
* **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-07-25T17:59:00Z",
    "services": {
      "database": "online",
      "ollama": "online",
      "energyplus": "idle"
    }
  }
  ```
* **Error Response (503 Service Unavailable)**:
  Returned if a critical service like Postgres or Ollama is offline.
  ```json
  {
    "status": "unhealthy",
    "timestamp": "2026-07-25T17:59:00Z",
    "services": {
      "database": "offline",
      "ollama": "online",
      "energyplus": "error"
    }
  }
  ```

---

### 2. GET `/api/metrics`
Retrieves the latest single timestep frame recorded from the building simulation.

* **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body: None
* **Response (200 OK)**:
  ```json
  {
    "timestamp": "2026-07-25T17:59:00Z",
    "run_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "indoor_temp": 22.4,
    "outdoor_temp": 28.1,
    "relative_humidity": 45.5,
    "occupancy_count": 8.0,
    "pmv": -0.12,
    "ppd": 5.4,
    "hvac_power_kw": 18.2,
    "lighting_power_kw": 4.5
  }
  ```
* **Error Response (404 Not Found)**:
  Returned if no active simulation run exists.
  ```json
  {
    "error": "Not Found",
    "message": "No metrics available. Simulation has not run."
  }
  ```

---

### 3. GET `/api/history`
Fetches historical metric sequences for visualization charts.

* **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Query Parameters:
    - `run_id`: UUID (Required)
    - `limit`: Integer (Optional, Default: 100)
* **Response (200 OK)**:
  ```json
  {
    "run_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "records_count": 2,
    "data": [
      {
        "timestamp": "2026-07-25T17:50:00Z",
        "indoor_temp": 22.2,
        "hvac_power_kw": 19.5
      },
      {
        "timestamp": "2026-07-25T17:55:00Z",
        "indoor_temp": 22.4,
        "hvac_power_kw": 18.2
      }
    ]
  }
  ```
* **Error Response (400 Bad Request)**:
  Returned if parameters fail validation.
  ```json
  {
    "error": "Bad Request",
    "message": "Parameter 'run_id' must be a valid UUID format."
  }
  ```

---

### 4. POST `/api/optimize`
Force executes a LangGraph decision step based on current metrics.

* **Request**:
  - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  - Body: None
* **Response (200 OK)**:
  ```json
  {
    "decision_id": "a90b4dcb-2c40-410a-8bfb-88a3b5a19020",
    "timestamp": "2026-07-25T17:59:10Z",
    "applied_settings": {
      "hvac": 22.0,
      "lighting": 75
    },
    "reason": "Occupancy is below threshold.",
    "model_performance": {
      "model": "qwen3-7b-instruct",
      "tokens_consumed": 450,
      "latency_seconds": 3.4
    }
  }
  ```
* **Error Response (500 Internal Server Error)**:
  Returned if the Qwen3 agent fails to generate controls or parse JSON.
  ```json
  {
    "error": "Agent execution failed",
    "message": "Ollama connection timeout after 60s."
  }
  ```

---

### 5. POST `/api/control`
Manually sets building values, bypassing AI control.

* **Request**:
  - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  - Body:
    ```json
    {
      "hvac_setpoint": 23.5,
      "lighting_dim": 80
    }
    ```
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "applied": {
      "hvac_setpoint": 23.5,
      "lighting_dim": 80
    },
    "timestamp": "2026-07-25T17:59:15Z"
  }
  ```
* **Error Response (422 Unprocessable Entity)**:
  Returned if setpoint adjustments violate safety thresholds.
  ```json
  {
    "error": "Validation Error",
    "message": "hvac_setpoint 35.0 exceeds maximum safety limit of 28.0C."
  }
  ```

---

### 6. GET `/api/simulation`
Retrieves simulator processes status.

* **Request**:
  - Headers: `Authorization: Bearer <token>`
  - Body: None
* **Response (200 OK)**:
  ```json
  {
    "run_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "status": "running",
    "speed_multiplier": 10.0,
    "elapsed_sim_seconds": 86400,
    "current_file": "small_office.idf"
  }
  ```

---

### 7. GET `/ws` (WebSockets)
Exposes the real-time websocket feed. Clients authenticate on connection via query parameters.

* **Request**:
  - URI: `ws://localhost:8000/ws?token=<operator_token>`
* **Server Push (Metrics Broadcast Frame)**:
  ```json
  {
    "event": "METRIC_UPDATE",
    "timestamp": "2026-07-25T17:59:20Z",
    "data": {
      "indoor_temp": 22.4,
      "outdoor_temp": 28.1,
      "hvac_power_kw": 18.2,
      "lighting_power_kw": 4.5
    }
  }
  ```
* **Server Push (Decision Logging Frame)**:
  ```json
  {
    "event": "DECISION_LOG",
    "timestamp": "2026-07-25T17:59:20Z",
    "data": {
      "hvac": 22.0,
      "lighting": 75,
      "reason": "Occupancy is below threshold."
    }
  }
  ```
* **Error on Websocket Handshake (403 Forbidden)**:
  Returned if websocket connecting lacks a token parameter or has an expired token.
