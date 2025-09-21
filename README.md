# RSI Calculator Project

A comprehensive cryptocurrency RSI (Relative Strength Index) calculator system with real-time data processing, featuring a Rust backend and modern Next.js dashboard.

## 🏗️ Architecture

```
CSV Data → Redpanda → RSI Calculator (Rust) → Dashboard (Next.js)
          (Message Broker)  (Processing Engine)     (Web Interface)
```

## 📁 Project Structure

```
RSI-Calculator/
├── scripts/                   # Automation & runner scripts
│   ├── setup-all.ps1         # One-time project setup
│   ├── run-rust.ps1          # Rust calculator runner
│   ├── run-dashboard.ps1     # Next.js dashboard runner
│   ├── run-docker.ps1        # Docker services manager
│   ├── stop-docker.ps1       # Docker cleanup script
│   ├── README.ps1            # Interactive help
│   ├── run.bat               # Windows batch alternative
│   └── README.md             # Scripts documentation
├── rsi-calculator/           # Rust RSI calculation engine
│   ├── src/main.rs           # Main application code
│   ├── Cargo.toml            # Rust dependencies
│   └── target/               # Compiled binaries
├── dashboard/                # Next.js web dashboard
│   ├── src/                  # React components & pages
│   ├── package.json          # Node.js dependencies
│   └── next.config.ts        # Next.js configuration
├── docker-compose.yml        # Redpanda services configuration
├── ingest.py                 # Data ingestion utility
├── trades_data.csv           # Sample trading data
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Docker Desktop** (running)
- **Rust** (latest stable) - [Install here](https://rustup.rs/)
- **Node.js** (v18+) - [Install here](https://nodejs.org/)

### Option 1: Automated Setup (Recommended)

```powershell
# One-time setup - installs all dependencies
.\scripts\setup-all.ps1

# Start the web dashboard (http://localhost:3000)
.\scripts\run-dashboard.ps1

# Start the RSI calculator
.\scripts\run-rust.ps1

# Start message broker services (optional)
.\scripts\run-docker.ps1 -Detached
```

### Option 2: Manual Setup

1. **Setup Dependencies:**
   ```bash
   # Install Rust dependencies
   cd rsi-calculator && cargo check && cd ..
   
   # Install Node.js dependencies
   cd dashboard && npm install && cd ..
   ```

2. **Start Services:**
   ```bash
   # Start Redpanda (message broker)
   docker-compose up -d
   
   # Start RSI Calculator
   cd rsi-calculator && cargo run --release
   
   # Start Dashboard
   cd dashboard && npm run dev
   ```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Main web interface |
| **Redpanda Console** | http://localhost:8080 | Message broker admin |
| **Kafka Broker** | localhost:19092 | Kafka API endpoint |
| **Schema Registry** | http://localhost:18081 | Schema management |
| **Proxy API** | http://localhost:18082 | REST API gateway |

## 📊 Features

- ✅ **Real-time RSI Calculation** - 14-period RSI with live updates
- ✅ **Interactive Charts** - Price and RSI visualization with Recharts
- ✅ **Token Selection** - Multi-token support with dropdown selector
- ✅ **Technical Indicators** - Overbought/Oversold signal detection
- ✅ **Modern UI** - Dark/Light theme with Tailwind CSS
- ✅ **Responsive Design** - Mobile-friendly dashboard
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Message Streaming** - Redpanda/Kafka integration
- ✅ **Rust Performance** - High-performance calculation engine

## 🛠️ Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-all.ps1` | Install all dependencies | `.\scripts\setup-all.ps1` |
| `run-dashboard.ps1` | Start Next.js dashboard | `.\scripts\run-dashboard.ps1` |
| `run-rust.ps1` | Run Rust calculator | `.\scripts\run-rust.ps1` |
| `run-docker.ps1` | Start Docker services | `.\scripts\run-docker.ps1 -Detached` |
| `stop-docker.ps1` | Stop Docker services | `.\scripts\stop-docker.ps1` |
| `README.ps1` | Show interactive help | `.\scripts\README.ps1` |

### Script Options

```powershell
# Rust calculator options
.\scripts\run-rust.ps1           # Debug mode
.\scripts\run-rust.ps1 -Release  # Optimized build
.\scripts\run-rust.ps1 -Watch    # Auto-reload on changes

# Dashboard options
.\scripts\run-dashboard.ps1             # Development server
.\scripts\run-dashboard.ps1 -Build      # Production build
.\scripts\run-dashboard.ps1 -Production # Production server

# Docker options
.\scripts\run-docker.ps1           # Foreground mode
.\scripts\run-docker.ps1 -Detached # Background mode
.\scripts\run-docker.ps1 -Logs     # View logs
```

## 🔧 Technology Stack

### Backend
- **Rust** - High-performance system programming
- **Cargo** - Package management and build system
- **rdkafka** - Kafka client library
- **tokio** - Async runtime

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for React
- **Lucide React** - Icon library

### Infrastructure
- **Redpanda** - Kafka-compatible message streaming
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container orchestration

## 🔄 Data Flow

1. **Data Input**: Trading data from CSV files
2. **Message Broker**: Redpanda streams data through topics
3. **Processing**: Rust calculator computes RSI indicators
4. **Visualization**: Next.js dashboard displays real-time charts
5. **Interaction**: Users can select tokens and view analytics

## 🐛 Troubleshooting

### Common Issues

**PowerShell Execution Policy**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Docker Not Running**
- Ensure Docker Desktop is started
- Check Docker status: `docker info`

**Port Conflicts**
- Dashboard: 3000
- Redpanda Console: 8080
- Kafka Broker: 19092
- Check running processes: `netstat -an | findstr :3000`

**Dependencies Missing**
```powershell
# Verify installations
rust --version
node --version
docker --version

# Run setup script
.\scripts\setup-all.ps1
```

### Getting Help

- Run `.\scripts\README.ps1` for interactive help
- Check `scripts/README.md` for detailed documentation
- Verify all prerequisites are installed with `.\scripts\setup-all.ps1`

## 📝 Development

### Project Commands

```bash
# Rust development
cd rsi-calculator
cargo build          # Build debug version
cargo build --release # Build optimized version
cargo test           # Run tests
cargo check          # Check for errors

# Next.js development
cd dashboard
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the provided scripts
5. Submit a pull request

## 📄 License

This project is part of an assignment and is intended for educational purposes.

---

**Quick Start Reminder**: Run `.\scripts\setup-all.ps1` first, then `.\scripts\run-dashboard.ps1` to get started! 🚀