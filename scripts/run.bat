@echo off
echo 🚀 RSI Calculator Project Runner
echo =================================
echo.
echo Available commands:
echo.
echo 1. scripts\run-rust.ps1      - Build and run Rust RSI calculator
echo 2. scripts\run-dashboard.ps1 - Install and run Next.js dashboard  
echo 3. scripts\run-docker.ps1    - Start Redpanda/Kafka with Docker
echo 4. scripts\setup-all.ps1     - Setup and install all dependencies
echo 5. scripts\stop-docker.ps1   - Stop all Docker containers
echo.
echo Examples:
echo   powershell .\scripts\run-dashboard.ps1  # Start the web dashboard
echo   powershell .\scripts\run-rust.ps1       # Run the RSI calculator
echo   powershell .\scripts\run-docker.ps1     # Start message broker services
echo.
echo 💡 Tip: Run setup-all.ps1 first if this is your first time!
echo.
pause