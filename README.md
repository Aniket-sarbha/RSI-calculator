# Crypto Trading Analytics System

A real-time cryptocurrency trading analytics system built with Redpanda, Rust, and NextJS.

## Architecture

```
CSV Data → Redpanda → RSI Calculator (Rust) → WebSocket → Dashboard (NextJS)
           (Kafka)    (Backend Service)                   (Frontend)
```

## Project Structure

```
Assignment/
├── scripts/                    # Automation scripts
│   ├── start-system.ps1      # Complete system startup (PowerShell)
│   ├── start-system.bat      # Complete system startup (Batch)
│   ├── run-backend.ps1       # Backend only
│   ├── run-frontend.ps1      # Frontend only
│   ├── run-redpanda.bat      # Redpanda only
│   └── run-ingest.bat        # Data ingestion only
├── rsi-calculator/            # Rust backend service
├── dashboard/                 # NextJS frontend
├── docker-compose.yml         # Redpanda configuration
├── ingest.py                 # Data ingestion script
├── trades_data.csv           # Trading data
└── README.md                 # This file
```

## Components

1. **Redpanda**: Message broker for real-time data streaming
2. **RSI Calculator**: Rust backend that calculates RSI indicators
3. **Dashboard**: NextJS frontend with real-time charts

## Quick Start

### Prerequisites
- Docker Desktop (running)
- Node.js (v18+)
- Rust (latest stable)
- Python 3.x with kafka-python

### Option 1: Run Everything at Once
```bash
# Using PowerShell (Recommended)
.\scripts\start-system.ps1

# Or using Batch
.\scripts\start-system.bat
```

### Option 2: Run Components Individually

1. **Start Redpanda**:
   ```bash
   docker-compose up -d
   ```

2. **Start RSI Calculator**:
   ```bash
   cd rsi-calculator
   cargo run --release
   ```

3. **Start Dashboard**:
   ```bash
   cd dashboard
   npm run dev
   ```

4. **Ingest Data**:
   ```bash
   python ingest.py
   ```

## Access Points

- **Dashboard**: http://localhost:3000
- **RSI Calculator API**: http://localhost:3001
- **Redpanda Console**: http://localhost:8080

## API Endpoints

- `GET /api/tokens` - List all tokens
- `GET /api/summaries` - Get all token summaries
- `GET /api/token/<address>` - Get specific token data
- `WS /ws` - WebSocket for real-time RSI updates

## Features

- ✅ Real-time RSI calculation (14-period)
- ✅ Interactive price and RSI charts
- ✅ WebSocket-based live updates
- ✅ Token selector dropdown
- ✅ Overbought/Oversold indicators
- ✅ Professional dashboard UI

## Troubleshooting

### RSI Calculator not receiving data
- Make sure Redpanda is running: `docker-compose ps`
- Check if data was ingested: Visit http://localhost:8080 (Redpanda Console)
- Restart RSI calculator with fresh consumer group

### Frontend not connecting
- Verify RSI calculator is running on port 3001
- Check browser console for WebSocket errors
- Ensure no firewall blocking connections

### Port conflicts
- RSI Calculator: 3001
- Dashboard: 3000  
- Redpanda Console: 8080
- Redpanda Kafka: 19092

## Data Flow

1. CSV trades data → `trade-data` topic (Redpanda)
2. RSI Calculator consumes from `trade-data`
3. Calculates 14-period RSI for each token
4. Publishes results to `rsi-data` topic
5. Exposes REST API and WebSocket for frontend
6. Dashboard consumes via WebSocket for real-time updates

## Technology Stack

- **Message Broker**: Redpanda (Kafka-compatible)
- **Backend**: Rust (tokio, rdkafka, warp)
- **Frontend**: NextJS 15, TypeScript, TailwindCSS
- **Charts**: Custom SVG charts
- **Real-time**: WebSocket connections