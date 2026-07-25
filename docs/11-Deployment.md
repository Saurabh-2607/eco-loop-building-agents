# Deployment Guide

This document outlines the deployment strategy, container configurations, reverse proxy settings, and backup policies for the EcoLoop platform.

---

## Deployment Flow

We employ a containerized infrastructure model orchestrated via Docker Compose on an AWS EC2 instance. The CI/CD pipeline runs on GitHub Actions.

```text
┌──────────────┐      ┌────────────────┐      ┌─────────────┐
│ GitHub Repo  ├─────►│ GitHub Actions ├─────►│   AWS EC2   │
│ (Main branch)│      │  (Build & Test)│      │  Instance   │
└──────────────┘      └────────────────┘      └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │   Docker    │
                                              │   Compose   │
                                              └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │    Caddy    │
                                              │ (Rev Proxy) │
                                              └──────┬──────┘
                                                     │
                                     ┌───────────────┴───────────────┐
                                     ▼                               ▼
                              ┌─────────────┐                 ┌─────────────┐
                              │ Next.js App │                 │ FastAPI App │
                              │ (Frontend)  │                 │  (Backend)  │
                              └─────────────┘                 └──────┬──────┘
                                                                     │
                                     ┌───────────────────────────────┤
                                     ▼                               ▼
                              ┌─────────────┐                 ┌─────────────┐
                              │   Postgres  │                 │    Ollama   │
                              │ (Database)  │                 │   (Qwen3)   │
                              └─────────────┘                 └─────────────┘
```

---

## Docker Compose Configuration (`docker-compose.yml`)

The following blueprint defines the multi-container production network:

```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2.8-alpine
    container_name: ecoloop-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - frontend
      - backend
    networks:
      - ecoloop-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ecoloop-frontend
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=https://ecoloop.example.com
    networks:
      - ecoloop-net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecoloop-backend
    restart: unless-stopped
    volumes:
      - ./weather_files:/app/weather
      - ./idf_models:/app/models
      - eplus_output:/app/output
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:${DB_PASSWORD}@db:5432/ecoloop
      - OLLAMA_HOST=http://ollama:11434
      - ENERGYPLUS_PATH=/usr/local/EnergyPlus-9-6-0
    depends_on:
      - db
      - ollama
    networks:
      - ecoloop-net

  db:
    image: postgres:16-alpine
    container_name: ecoloop-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=ecoloop
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ecoloop-net

  ollama:
    image: ollama/ollama:latest
    container_name: ecoloop-ollama
    restart: unless-stopped
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    networks:
      - ecoloop-net

networks:
  ecoloop-net:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:
  postgres_data:
  ollama_data:
  eplus_output:
```

---

## Caddy Reverse Proxy & SSL Setup

Caddy routes external HTTP/S requests to internal containers. It terminates SSL automatically using ACME providers (Let's Encrypt / ZeroSSL).

### `Caddyfile`
```text
ecoloop.example.com {
    # Compress outputs
    encode gzip

    # Route backend endpoints & WebSocket to the FastAPI backend
    handle /api/* {
        reverse_proxy backend:8000
    }
    
    handle /ws {
        reverse_proxy backend:8000
    }

    # Route all other dashboard traffic to the Next.js frontend
    handle {
        reverse_proxy frontend:3000
    }

    log {
        output file /var/log/caddy/access.log
    }
}
```

---

## Environment Variables Configuration

Create a `.env` file in the root directory. Never check this file into source control.

```env
# System Configuration
ENVIRONMENT=production
SECRET_KEY=generate-a-secure-random-key-here

# Database Configuration
DB_PASSWORD=select-a-strong-password-here

# LLM Configurations
OLLAMA_HOST=http://ollama:11434
LLM_MODEL_NAME=qwen3-7b-instruct

# EnergyPlus Configurations
SIM_STEP_MULTIPLIER=10
SAFETY_MIN_COOLING_SETPOINT=20.0
SAFETY_MAX_COOLING_SETPOINT=26.0
```

---

## Storage & Docker Volumes Strategy

- **`postgres_data`**: Persists PostgreSQL rows across container updates.
- **`ollama_data`**: Stores local LLM model weight parameters (avoiding redownloads of Qwen3 during container rebuilds).
- **`caddy_data` / `caddy_config`**: Retains certificates and routing states.
- **`eplus_output`**: Captures temporary simulation log outputs for operators checking raw system results.

---

## Backup Strategy

### PostgreSQL Daily Backup
A shell script run via a system cron job dumps the database snapshot, packages it, and uploads the archive to an AWS S3 bucket.

```bash
#!/bin/bash
# file: scripts/backup-db.sh

BACKUP_DIR="/opt/ecoloop/backups"
TIMESTAMP=$(date +\%F-\%H\%M\%S)
FILENAME="ecoloop-db-$TIMESTAMP.sql.gz"
S3_BUCKET="s3://ecoloop-backups-bucket/db"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform dump
docker exec -t ecoloop-db pg_dumpall -U postgres | gzip > "$BACKUP_DIR/$FILENAME"

# Sync to S3
aws s3 cp "$BACKUP_DIR/$FILENAME" "$S3_BUCKET/$FILENAME"

# Prune backups older than 7 days locally
find "$BACKUP_DIR" -type f -mtime +7 -delete
```

Set standard cron permissions:
```text
0 2 * * * /bin/bash /opt/ecoloop/scripts/backup-db.sh >> /var/log/ecoloop/backup.log 2>&1
```
