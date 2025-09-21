# RSI Calculator - Scripts Documentation

This folder contains convenient scripts to run different parts of the RSI Calculator project.

## Prerequisites

Before running any scripts, ensure you have:

- **Rust** (cargo) - Install from https://rustup.rs/
- **Node.js** (npm) - Install from https://nodejs.org/
- **Docker** - Install from https://docker.com/

## Available Scripts

### Setup Scripts

- **`setup-all.ps1`** - One-time setup script that installs all dependencies
  ```powershell
  .\scripts\setup-all.ps1
  ```

### Main Application Scripts

- **`run-rust.ps1`** - Build and run the Rust RSI calculator
  ```powershell
  .\scripts\run-rust.ps1           # Debug mode
  .\scripts\run-rust.ps1 -Release  # Optimized release mode
  .\scripts\run-rust.ps1 -Watch    # Auto-reload on changes
  ```

- **`run-dashboard.ps1`** - Run the Next.js web dashboard
  ```powershell
  .\scripts\run-dashboard.ps1             # Development server
  .\scripts\run-dashboard.ps1 -Install    # Install/update dependencies
  .\scripts\run-dashboard.ps1 -Build      # Build for production
  .\scripts\run-dashboard.ps1 -Production # Start production server
  ```

### Docker Scripts

- **`run-docker.ps1`** - Start Redpanda/Kafka message broker services
  ```powershell
  .\scripts\run-docker.ps1           # Start in foreground
  .\scripts\run-docker.ps1 -Detached # Start in background
  .\scripts\run-docker.ps1 -Logs     # View container logs
  .\scripts\run-docker.ps1 -Build    # Rebuild and start
  ```

- **`stop-docker.ps1`** - Stop Docker services
  ```powershell
  .\scripts\stop-docker.ps1          # Stop services
  .\scripts\stop-docker.ps1 -Clean   # Stop and remove containers
  .\scripts\stop-docker.ps1 -Clean -Volumes # Remove everything
  ```

### Helper Scripts

- **`README.ps1`** - Display help information and available commands
- **`run.bat`** - Batch file alternative for Windows users

## Quick Start

1. **First time setup:**
   ```powershell
   .\scripts\setup-all.ps1
   ```

2. **Start the dashboard:**
   ```powershell
   .\scripts\run-dashboard.ps1
   ```
   Dashboard will be available at: http://localhost:3000

3. **Start message broker (optional):**
   ```powershell
   .\scripts\run-docker.ps1 -Detached
   ```
   Redpanda Console: http://localhost:8080

4. **Run the RSI calculator:**
   ```powershell
   .\scripts\run-rust.ps1
   ```

## Service URLs

When services are running:

- **Dashboard**: http://localhost:3000
- **Redpanda Console**: http://localhost:8080
- **Kafka Broker**: localhost:19092
- **Schema Registry**: http://localhost:18081
- **Proxy API**: http://localhost:18082

## Troubleshooting

- If PowerShell execution is restricted, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- For permission issues, try running PowerShell as Administrator
- Make sure Docker Desktop is running before using Docker scripts
- Use `.\scripts\setup-all.ps1` to verify all dependencies are installed

## Notes

- Scripts automatically check for required dependencies
- All scripts include helpful error messages and usage tips
- Use `-Detached` with Docker scripts to run services in background
- The ingest script is intentionally excluded as requested