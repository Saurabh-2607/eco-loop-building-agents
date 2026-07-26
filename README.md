# EcoLoop Building Agents

AI-powered autonomous building optimization platform integrating **EnergyPlus Digital Twin simulation**, **LangGraph Multi-Agent cognitive networks**, **FastAPI server backends**, **Next.js frontends**, and **hosted Qwen3 LLMs** to deliver premium, real-time building control automation.

---

## Key Features

1. **Continuous Digital Twin**: EnergyPlus simulation runs continuously in the background, updating building telemetry steps (indoor temperature, HVAC load, occupancy, lighting demand) sequentially.
2. **Self-Healing Datastores**: Automatically checks for PostgreSQL port `5432` on boot. In developer modes (without local PostgreSQL running), it falls back seamlessly to SQLite (`local_e2e.db`) and auto-bootstraps table structures. Supports cloud Neon PostgreSQL connections with `asyncpg` + `ssl=require`.
3. **4-Stage Pipeline Stepper**:
   - `✓ Observation`: Gathers real-time building sensors (Zone Temperature, Humidity, Total Power).
   - `✓ Analysis`: Extracts thermal zone coefficients and comfort margins.
   - `✓ Decision`: LangGraph multi-agent reasons over comfort bounds (ASHRAE Standard 55) and peak load hours.
   - `✓ Actuation`: Automatically overrides HVAC thermostat and lighting dimmers in the simulator twin.
4. **Interactive Dashboard**:
   - **Rounded KPI Cards**: Restructured to span a horizontal row at the very top for clean scannability, with values formatted to 1 decimal place to prevent overflow text clipping.
   - **Markdown Rationale Renderer**: Renders rich LLM explanations cleanly with appropriate list formatting and bold styling.
   - **Smooth Dark Theme Toggle**: Features system theme synchronization and a smooth manual dark/light theme switch built into the top navigation.

---

## Directory Structure

```
├── apps
│   ├── backend               # FastAPI backend app, workers, and database session manager
│   │   ├── app
│   │   │   ├── ai            # LangGraph agent definitions and node logic
│   │   │   ├── api           # API endpoints (/realtime/state, /simulation)
│   │   │   └── workers       # Background workers (Simulation twin, Collector, Optimizer)
│   │   └── scripts           # Database standalone migration/seeding scripts
│   └── web                   # Next.js frontend SPA dashboard client
```

---

## Getting Started

### 1. Database Setup & Seeding

Database table migrations and baseline metrics seeding are handled strictly through a dedicated migration script. Run this prior to booting the backend server:

```bash
cd apps/backend
# Activate virtual environment
source .venv/bin/activate
# Run database schema migration & seed 5-hour evening telemetry baseline (18:00 to 22:00 IST of July 26, 2026)
python scripts/seed.py
```

### 2. Booting the Backend Server

Start the FastAPI application. It automatically connects to the seeded run record (`run: 00000000-0000-0000-0000-000000000001`) and boots the background digital twin starting at step 6 (Hour 23:00):

```bash
cd apps/backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Running the Web Frontend

Initialize the Next.js client application:

```bash
cd apps/web
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the real-time building optimization loop.
