# RSI Calculator Project Runner
# This script provides easy access to run different parts of the project

Write-Host "🚀 RSI Calculator Project Runner" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. .\scripts\run-rust.ps1      - Build and run Rust RSI calculator" -ForegroundColor Green
Write-Host "2. .\scripts\run-dashboard.ps1 - Install and run Next.js dashboard" -ForegroundColor Green
Write-Host "3. .\scripts\run-docker.ps1    - Start Redpanda/Kafka with Docker" -ForegroundColor Green
Write-Host "4. .\scripts\setup-all.ps1     - Setup and install all dependencies" -ForegroundColor Green
Write-Host "5. .\scripts\stop-docker.ps1   - Stop all Docker containers" -ForegroundColor Green
Write-Host ""
Write-Host "Examples:" -ForegroundColor Yellow
Write-Host "  .\scripts\run-dashboard.ps1  # Start the web dashboard" -ForegroundColor Gray
Write-Host "  .\scripts\run-rust.ps1       # Run the RSI calculator" -ForegroundColor Gray
Write-Host "  .\scripts\run-docker.ps1     # Start message broker services" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: Run setup-all.ps1 first if this is your first time!" -ForegroundColor Magenta