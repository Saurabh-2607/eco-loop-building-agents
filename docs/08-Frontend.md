# Frontend Architecture

The EcoLoop frontend is built using Next.js 15, React 19, and Tailwind CSS. It is a single-page style app layout with multiple client-side tabs/routes designed to provide instantaneous visual feedback on the state of the building simulation and the decisions of the AI Agent.

---

## Folder Structure

The project uses the Next.js App Router pattern. All frontend assets are located under the `frontend/` directory.

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Main entry point (Providers, Sidebar layout)
│   │   ├── page.tsx           # Redirects to dashboard or displays it
│   │   ├── dashboard/         # Dashboard Page Route
│   │   │   └── page.tsx
│   │   ├── analytics/         # Analytics Page Route
│   │   │   └── page.tsx
│   │   ├── decisions/         # AI Decision Log Page Route
│   │   │   └── page.tsx
│   │   ├── simulation/        # Simulation Control Page Route
│   │   │   └── page.tsx
│   │   └── settings/          # System Settings Page Route
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui shared primitives (Button, Dialog, etc.)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx    # Left-hand main navigation panel
│   │   │   └── Navbar.tsx     # Top header bar showing system status
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx      # Multi-value metric display card
│   │   │   ├── EnergyChart.tsx     # Line/Area chart for power usage
│   │   │   └── TempChart.tsx       # Line/Area chart for target vs actual temperature
│   │   ├── decisions/
│   │   │   └── DecisionTimeline.tsx # Timeline visualization of agent actions
│   │   └── simulation/
│   │       ├── SimulationControls.tsx # Play, Pause, Reset, Step actions
│   │       └── SimulationLogs.tsx     # Terminal log viewer for simulator output
│   ├── hooks/
│   │   ├── useSocket.ts       # Custom hook for WebSocket connections
│   │   └── useSimulation.ts   # Custom hook interfacing with simulator endpoints
│   ├── store/
│   │   └── useAppStore.ts     # Zustand store for client state management
│   ├── lib/
│   │   ├── api.ts             # Axios base client wrapper
│   │   └── utils.ts           # CSS merging helper classes
│   └── types/
│       └── index.ts           # Shared TypeScript interfaces
├── package.json
└── tailwind.config.js
```

---

## Page Layouts & Views

### 1. Dashboard View
- **Purpose**: Displays the real-time operational status of the building.
- **Key Sections**:
  - Live KPIs (Indoor Temp, Outdoor Temp, HVAC Power, Comfort Index).
  - Synchronized real-time chart tracking power draw and comfort thresholds.
  - Active controller status (Autonomous AI vs manual schedule overrides).

### 2. Analytics View
- **Purpose**: Offers deep-dive query tools for historical analysis.
- **Key Sections**:
  - Date Range selector controls.
  - Interactive comparison overlays (e.g., this week's energy consumption vs last week's).
  - Cumulative savings calculations.

### 3. AI Decisions View
- **Purpose**: Fully details the reasoning output of the LangGraph agent.
- **Key Sections**:
  - Timeline of actions.
  - Expanded JSON response payloads containing model explanations and confidence ratings.
  - Performance feedback inputs allowing users to mark decisions as "Correct" or "Incorrect".

### 4. Simulation View
- **Purpose**: Inspects the low-level behavior of the EnergyPlus runtime engine.
- **Key Sections**:
  - Run state controllers (Step, Pause, Stop, Speeds).
  - Direct actuator override sliders for testing manual control variables.
  - Live standard output console feed.

### 5. Settings View
- **Purpose**: Configures global variables for API hosts, LLM models, and safety boundaries.
- **Key Sections**:
  - API and Ollama Host connection urls.
  - Model select options (Qwen3, Llama3).
  - Safety thresholds (Max/Min HVAC temperature bounds).

---

## Component Specifications

| Component | Responsibility | Props/Dependencies |
| :--- | :--- | :--- |
| **Sidebar** | Provides collapsible app-level routing links. | Pathname |
| **Navbar** | Displays global system states (Ollama Online/Offline, Simulator Status). | Status Store, `useSocket` state |
| **MetricCard** | General-purpose metric card showing trends (e.g. `+12% vs last hour`). | Title, value, units, delta, icon |
| **EnergyChart** | Dual area-line chart showing total energy usage vs grid bounds. | Chart data array |
| **TempChart** | Multi-line chart mapping Indoor, Outdoor, Heating, and Cooling setpoints. | Chart data array |
| **DecisionTimeline** | Renders a chronological list of agent decisions. | Decision history array |
| **SimulationControls** | Launches/controls simulation process runs. | Simulator state, click callback |
| **SimulationLogs** | Displays active output lines from the simulator process. | WebSocket logs feed |

---

## State Management (`Zustand`)

The frontend uses Zustand for simple state management. The global state is split into three main logical parts:
1. **Simulation State**: Stores current speed, run-state (`IDLE`, `RUNNING`, `PAUSED`, `FINISHED`), and IDF model metadata.
2. **Real-time Metrics**: Accumulates sliding-window chart metrics (capping charts at 100 entries to prevent memory exhaustion).
3. **UI Preferences**: Sidebar state, dark mode preferences, and selected temperature scales.

Example state definition:
```typescript
interface AppState {
  simStatus: 'idle' | 'running' | 'paused' | 'error';
  setSimStatus: (status: 'idle' | 'running' | 'paused' | 'error') => void;
  metricsBuffer: MetricFrame[];
  addMetricFrame: (frame: MetricFrame) => void;
  clearMetrics: () => void;
}
```

---

## API Layer & WebSocket Integration

### REST Queries (TanStack Query)
All network operations use custom hooks wrapping `@tanstack/react-query` to manage automatic fetching, loading states, and mutations.
* **Queries**: `/api/v1/metrics/history`, `/api/v1/decisions/history`
* **Mutations**: `/api/v1/simulation/control` (send play/pause), `/api/v1/control/override` (send manual actuation overrides)

### WebSocket Connection Management (`useSocket`)
A custom React hook establishes a singleton WebSocket connection to the FastAPI server:
* **Reconnection Strategy**: Exponential backoff starting at 1s, doubling up to a max of 30s.
* **Heartbeat Protocol**: Sends a `"ping"` payload every 20s. If the client fails to receive a `"pong"` response within 5s, the connection is reset.
* **Frame Routing**:
  - `METRICS`: Dispatched directly to the Zustand state buffer.
  - `DECISION`: Injected into the decision history log feed.
  - `CONSOLE_LOG`: Appended to the console logger state.
