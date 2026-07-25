# Technology Stack Specification

This document details the complete technology stack used across the EcoLoop Building Agents platform.

---

## Frontend

The frontend is a modern web application designed for real-time monitoring, analytical review, and manual override controls.

| Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| **Next.js** | 15.x | Core Web Framework | App Router support, server-side rendering (SSR) for static layouts, client-side hydration, and built-in API routing. |
| **React** | 19.x | UI Library | Declarative UI rendering, fast virtual DOM reconciliation, and ecosystem compatibility. |
| **TypeScript** | 5.x | Programming Language | Type safety, enhanced IDE autocomplete, self-documenting codebases, and reduced run-time errors. |
| **Tailwind CSS** | 4.x / 3.4 | CSS Utility Framework | Rapid utility-first styling, design system alignment, and optimized bundle sizes via purging. |
| **shadcn/ui** | Latest | Component Library | Accessible, fully-customizable, copy-paste components built on Radix UI primitives. |
| **Recharts** | 2.x | Data Visualization | SVG-based charting optimized for rendering real-time time-series energy and temperature metrics. |
| **Zustand** | 5.x | State Management | Light, minimalist, hook-based state management for local dashboard states and settings. |
| **TanStack Query** | 5.x | Data Fetching & Caching | Server-state synchronizer, background refetching, query caching, and status indicators. |
| **Lucide React** | Latest | Icon Set | Uniform, lightweight vector icons matching shadcn design patterns. |

---

## Backend

The backend acts as the central coordinator, communicating with the frontend via HTTP REST and WebSockets, writing to PostgreSQL, and driving the simulation & AI optimization loop.

| Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| **FastAPI** | 0.111+ | REST / WebSocket API | High-performance asynchronous requests handling, automatic OpenAPI/Swagger documentation. |
| **Python** | 3.12 | Core Programming Language | Rich scientific computing package support, first-class async/await syntax, and native EnergyPlus API bindings. |
| **SQLModel** | 0.0.22+ | ORM / DB Access | Unifies SQL database definition and Pydantic validation into a single class definition, avoiding duplicate code. |
| **Pydantic** | 2.x | Data Validation | Parses and validates JSON request payloads, configuration variables, and agent outputs with high speed. |
| **Uvicorn** | 0.30+ | ASGI Web Server | Lightning-fast, production-ready server supporting HTTP/1.1 and WebSockets. |

---

## AI Agent

The AI Agent runs the optimization loops by reading simulation data and predicting ideal setpoints.

| Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| **LangGraph** | 0.2+ | Agentic Workflow | Models the optimization agent as a stateful cyclical graph, enabling self-correction, tool execution, and retry patterns. |
| **LangChain** | 0.2+ | LLM Utilities | Abstractions for prompt templates, chat model integrations, parser tools, and memory managers. |
| **Ollama** | 0.2+ | Local LLM Hosting | Executes Qwen3 models locally, ensuring offline data privacy and avoiding API call expenses. |
| **Qwen3 (Qwen2.5)** | 7B-Instruct | Reasoner / Model | High instruction-following accuracy, strong JSON structured-output conformance, and optimized for edge deployment. |

---

## Infrastructure & Database

The deployment configuration is containerized to ensure identical development and production environments.

| Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| **Docker** | 26.x+ | Application Containerization| Package services into immutable images, isolating libraries, Python versions, and runtime binaries. |
| **Docker Compose** | 2.x | Multi-container orchestration | Configures networking, volumes, environment files, and start-up dependencies in a single `docker-compose.yml`. |
| **Caddy** | 2.8+ | Reverse Proxy & SSL | Automated Let's Encrypt / ZeroSSL certificate management, simple configuration, and HTTP/3 support. |
| **AWS EC2** | t3.xlarge+ | Cloud Hosting Platform | Scalable virtual server with sufficient CPU/RAM memory to host Ollama, Postgres, and the simulator in parallel. |
| **PostgreSQL** | 16.x | Relational Database | Time-series friendly relational data storage for metrics, agent logs, configurations, and optimization histories. |

---

## Monitoring

Ensures service reliability and facilitates rapid debugging.

| Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| **Loguru** | 0.7+ | Structured Logging | Color-coded console logs and rotatable JSON log files with simple format setups. |
| **FastAPI Health** | Built-in | System Health Checks | Endpoint exposing the status of database connections, Ollama readiness, and simulator runtime. |
