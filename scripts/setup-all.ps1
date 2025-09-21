# Setup All Dependencies
# This script sets up all dependencies for the RSI Calculator project

Write-Host "🚀 RSI Calculator Project Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$errors = @()

# Check Rust installation
Write-Host "🦀 Checking Rust installation..." -ForegroundColor Yellow
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    $rustVersion = cargo --version
    Write-Host "✅ Rust found: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Rust not found!" -ForegroundColor Red
    $errors += "Rust/Cargo is not installed. Install from: https://rustup.rs/"
}

# Check Node.js installation
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    $errors += "Node.js is not installed. Install from: https://nodejs.org/"
}

# Check npm installation
Write-Host "📦 Checking npm installation..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    $errors += "npm is not installed. Usually comes with Node.js."
}

# Check Docker installation
Write-Host "🐳 Checking Docker installation..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $dockerVersion = docker --version
        Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
        
        # Check if Docker is running
        docker info | Out-Null
        Write-Host "✅ Docker is running!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Docker found but not running. Start Docker Desktop." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Docker not found!" -ForegroundColor Red
    $errors += "Docker is not installed. Install from: https://docker.com/"
}

# If there are errors, show them and exit
if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Setup cannot continue. Please install missing dependencies:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  • $error" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "✅ All prerequisites found! Setting up project..." -ForegroundColor Green

# Setup Rust dependencies
Write-Host ""
Write-Host "🦀 Setting up Rust project..." -ForegroundColor Yellow
Set-Location "rsi-calculator"
try {
    cargo check
    Write-Host "✅ Rust dependencies checked!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Rust setup had issues, but continuing..." -ForegroundColor Yellow
}
Set-Location ".."

# Setup Node.js dependencies
Write-Host ""
Write-Host "📦 Setting up Node.js project..." -ForegroundColor Yellow
Set-Location "dashboard"
try {
    npm install
    Write-Host "✅ Node.js dependencies installed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Node.js dependencies!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Quick start commands:" -ForegroundColor Yellow
Write-Host "  .\scripts\run-dashboard.ps1  # Start web dashboard" -ForegroundColor Green
Write-Host "  .\scripts\run-rust.ps1       # Run RSI calculator" -ForegroundColor Green
Write-Host "  .\scripts\run-docker.ps1 -Detached # Start message broker" -ForegroundColor Green
Write-Host ""
Write-Host "📖 For more options: .\scripts\README.ps1" -ForegroundColor Magenta