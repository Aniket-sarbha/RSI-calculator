# Stop Docker Services
# This script stops and cleans up Docker containers

param(
    [switch]$Clean,
    [switch]$Volumes
)

Write-Host "🛑 Stopping Docker Services" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Check if Docker is installed
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker not found!" -ForegroundColor Red
    exit 1
}

# Check if docker-compose.yml exists
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: docker-compose.yml not found!" -ForegroundColor Red
    exit 1
}

try {
    if ($Clean -and $Volumes) {
        Write-Host "🧹 Stopping services and removing containers, networks, and volumes..." -ForegroundColor Yellow
        docker-compose down -v --remove-orphans
        Write-Host "✅ All services stopped and volumes removed!" -ForegroundColor Green
    } elseif ($Clean) {
        Write-Host "🧹 Stopping services and removing containers and networks..." -ForegroundColor Yellow
        docker-compose down --remove-orphans
        Write-Host "✅ All services stopped and cleaned up!" -ForegroundColor Green
    } else {
        Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
        docker-compose stop
        Write-Host "✅ All services stopped!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error occurred: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Usage tips:" -ForegroundColor Yellow
Write-Host "  .\scripts\stop-docker.ps1          # Stop services (containers remain)" -ForegroundColor Gray
Write-Host "  .\scripts\stop-docker.ps1 -Clean   # Stop and remove containers" -ForegroundColor Gray
Write-Host "  .\scripts\stop-docker.ps1 -Clean -Volumes # Stop and remove everything" -ForegroundColor Gray