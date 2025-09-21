# Run Docker Services
# This script starts the Redpanda/Kafka services using Docker Compose

param(
    [switch]$Detached,
    [switch]$Build,
    [switch]$Logs
)

Write-Host "🐳 Docker Services Runner" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Check if Docker is installed and running
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker not found. Please install Docker Desktop from https://docker.com/" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose.yml exists
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: docker-compose.yml not found in current directory!" -ForegroundColor Red
    exit 1
}

try {
    if ($Logs) {
        Write-Host "📋 Showing container logs..." -ForegroundColor Yellow
        docker-compose logs -f
    } elseif ($Build) {
        Write-Host "🏗️  Building and starting services..." -ForegroundColor Yellow
        docker-compose up --build
    } elseif ($Detached) {
        Write-Host "🚀 Starting services in detached mode..." -ForegroundColor Green
        docker-compose up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Services started successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Service URLs:" -ForegroundColor Yellow
            Write-Host "  Redpanda Console: http://localhost:8080" -ForegroundColor Magenta
            Write-Host "  Kafka Broker:     localhost:19092" -ForegroundColor Magenta
            Write-Host "  Schema Registry:  http://localhost:18081" -ForegroundColor Magenta
            Write-Host "  Proxy API:        http://localhost:18082" -ForegroundColor Magenta
            Write-Host ""
            Write-Host "📋 To view logs: .\scripts\run-docker.ps1 -Logs" -ForegroundColor Gray
            Write-Host "🛑 To stop:      .\scripts\stop-docker.ps1" -ForegroundColor Gray
        }
    } else {
        Write-Host "🚀 Starting services (attached mode)..." -ForegroundColor Green
        Write-Host "💡 Press Ctrl+C to stop all services" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🌐 Service URLs:" -ForegroundColor Yellow
        Write-Host "  Redpanda Console: http://localhost:8080" -ForegroundColor Magenta
        Write-Host "  Kafka Broker:     localhost:19092" -ForegroundColor Magenta
        Write-Host ""
        docker-compose up
    }
} catch {
    Write-Host "❌ Error occurred: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Usage tips:" -ForegroundColor Yellow
Write-Host "  .\scripts\run-docker.ps1           # Start services (attached)" -ForegroundColor Gray
Write-Host "  .\scripts\run-docker.ps1 -Detached # Start services (background)" -ForegroundColor Gray
Write-Host "  .\scripts\run-docker.ps1 -Logs     # Show container logs" -ForegroundColor Gray
Write-Host "  .\scripts\run-docker.ps1 -Build    # Rebuild and start" -ForegroundColor Gray