# Run Next.js Dashboard
# This script installs dependencies and runs the Next.js dashboard

param(
    [switch]$Build,
    [switch]$Production,
    [switch]$Install
)

Write-Host "⚡ Next.js Dashboard Runner" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: npm not found. Please install npm." -ForegroundColor Red
    exit 1
}

# Navigate to the dashboard directory
$dashboardDir = "dashboard"
if (!(Test-Path $dashboardDir)) {
    Write-Host "❌ Error: $dashboardDir directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $dashboardDir

try {
    # Check if node_modules exists
    if ($Install -or !(Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    }

    if ($Build) {
        Write-Host "🏗️  Building production bundle..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    } elseif ($Production) {
        Write-Host "🚀 Starting production server..." -ForegroundColor Green
        Write-Host "🌐 Dashboard will be available at: http://localhost:3000" -ForegroundColor Magenta
        npm run start
    } else {
        Write-Host "🚀 Starting development server..." -ForegroundColor Green
        Write-Host "🌐 Dashboard will be available at: http://localhost:3000" -ForegroundColor Magenta
        Write-Host "📝 Hot reload enabled - changes will update automatically" -ForegroundColor Yellow
        npm run dev
    }
} catch {
    Write-Host "❌ Error occurred: $_" -ForegroundColor Red
} finally {
    Set-Location ..
}

Write-Host ""
Write-Host "💡 Usage tips:" -ForegroundColor Yellow
Write-Host "  .\scripts\run-dashboard.ps1             # Start development server" -ForegroundColor Gray
Write-Host "  .\scripts\run-dashboard.ps1 -Install    # Install/update dependencies" -ForegroundColor Gray
Write-Host "  .\scripts\run-dashboard.ps1 -Build      # Build for production" -ForegroundColor Gray
Write-Host "  .\scripts\run-dashboard.ps1 -Production # Start production server" -ForegroundColor Gray