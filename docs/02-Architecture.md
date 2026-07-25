# System Architecture

## High-Level Architecture

```text
                    Internet
                        │
                     Caddy
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
 Next.js Dashboard                FastAPI Backend
                                          │
                                          ▼
                                 LangGraph AI Agent
                                          │
                                          ▼
                                    Ollama (Qwen3)
                                          │
                                          ▼
                                 EnergyPlus Runtime
                                          │
                                          ▼
                                 Building Simulation
```

Below is the corresponding component diagram illustrating communication protocols:

```mermaid
graph TD
    Client[Browser Client] <-->|HTTPS / WSS| Proxy[Caddy Reverse Proxy]
    Proxy <-->|HTTP / WS| Frontend[Next.js App Server]
    Proxy <-->|HTTP / WS| Backend[FastAPI Backend]
    Backend <-->|SQLModel| DB[(PostgreSQL Database)]
    Backend <-->|Python API| EPlus[EnergyPlus Runtime]
    Backend <-->|LangChain| Ollama[Ollama Server Qwen3]
```

---

## Component Responsibilities

### 1. Caddy Reverse Proxy
- **Traffic Routing**: Acts as the single ingress point, routing traffic to the Next.js Frontend or the FastAPI Backend based on matching URL routes (`/` vs `/api/*`).
- **SSL Termination**: Automatically handles TLS certificate generation and renewal.

### 2. Next.js Dashboard
- **Live Monitoring UI**: Renders charts, KPIs, logs, and timelines in real-time.
- **State Management**: Uses Zustand to maintain dashboard layout preferences and local states.
- **Server Actions & API Consumption**: Fetches initial states via SSR and hydrates live metrics using WebSocket subscriptions.

### 3. FastAPI Backend
- **Data Ingestion**: Exposes REST and WebSocket endpoints for dashboard queries, simulation control, and system health checks.
- **Simulation Management**: Orchestrates the launch, pause, step, and stop controls of the EnergyPlus runtime.
- **AI Agent Host**: Exposes the trigger interface for the LangGraph Optimization Agent.
- **Database Handler**: Handles writing simulation metrics, agent decisions, and audit trails to the PostgreSQL database.

### 4. LangGraph AI Agent
- **State Machine Routing**: Manages the multi-step optimization workflow (evaluating metrics, validating options, deciding control variables, formatting output).
- **Tool Execution**: Enables the agent to query historical ranges or consult simulation metadata.
- **Self-Correction Loop**: Validates LLM output formatting and retries code extraction if parsing errors occur.

### 5. Ollama (Qwen3)
- **Local Model Execution**: Runs the Qwen3 7B Instruct model locally on an execution container.
- **Inference Server**: Exposes standard OpenAI-compatible API endpoints for LangChain to execute prompt templates.

### 6. EnergyPlus Runtime
- **Physical Building Simulator**: Processes building models (IDF files) and weather datasets (EPW files).
- **Python API Integration**: Executes inline Python callbacks within the EnergyPlus execution loop, enabling real-time variable inspection and actuator overriding.

### 7. PostgreSQL Database
- **Persistent Data Store**: Houses long-term metrics, agent optimization choices, error logs, and credential schemas.

---

## Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Dashboard Client
    participant Proxy as Caddy Proxy
    participant Backend as FastAPI Backend
    participant DB as PostgreSQL
    participant EPlus as EnergyPlus Simulator
    participant Agent as LangGraph Agent

    User->>Proxy: GET /api/metrics (initial load)
    Proxy->>Backend: Forward query
    Backend->>DB: Query SimulationMetrics
    DB-->>Backend: Return recent data rows
    Backend-->>User: JSON Metrics Response

    User->>Proxy: Connect WebSocket /ws
    Proxy->>Backend: Upgrade connection to WebSocket
    EPlus->>Backend: Post metrics (Runtime API callback)
    Backend->>DB: Save metrics
    Backend->>User: Push metrics frame via WS

    Note over Backend, Agent: Optimization Loop trigger (cron/interval)
    Backend->>Agent: Optimize(Current state metrics)
    Agent->>Agent: Evaluate parameters & call tools
    Agent-->>Backend: JSON Command Output {hvac, lighting}
    Backend->>EPlus: Override actuators (HVAC setpoint, light dimming)
    Backend->>DB: Save AgentDecisions record
```

---

## AI Workflow (LangGraph)

The Optimization Agent executes as a stateful graph where each node represents a specific reasoning phase:

```mermaid
graph TD
    Start([Start Loop]) --> ReadState[Node: Read Simulation State]
    ReadState --> EvaluateComfort[Node: Evaluate Comfort Indices]
    EvaluateComfort --> QueryHistory[Node: Query Historical Trends]
    QueryHistory --> LLMReason[Node: Qwen3 JSON Generator]
    LLMReason --> ValidateJSON{Validate Output Schema}
    ValidateJSON -->|Invalid| RepairPrompt[Node: Apply Repair Schema]
    RepairPrompt --> LLMReason
    ValidateJSON -->|Valid| ApplyControls[Node: Output Controls & Terminate]
    ApplyControls --> End([End Graph])
```

---

## Deployment & Docker Network Topology

The system is deployed using Docker Compose on an AWS EC2 instance. All backend services reside on a private internal virtual bridge network, while only Caddy is exposed to the host's public ports.

```mermaid
graph TB
    subgraph Host Network
        Port80[Port 80 HTTP]
        Port443[Port 443 HTTPS]
    end

    subgraph Docker Compose Bridge Network
        Caddy[Caddy Service Container]
        NextJS[Next.js App Container]
        FastAPI[FastAPI Backend Container]
        Postgres[(PostgreSQL DB Container)]
        Ollama[Ollama Container]
    end

    Port80 --> Caddy
    Port443 --> Caddy

    Caddy -.->|Internal:3000| NextJS
    Caddy -.->|Internal:8000| FastAPI
    FastAPI -.->|Internal:5432| Postgres
    FastAPI -.->|Internal:11434| Ollama
    FastAPI -.->|Direct Process Link| EnergyPlus[EnergyPlus Runtime]
```
