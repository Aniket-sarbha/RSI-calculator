# Run Rust RSI Calculator
# This script builds and runs the Rust-based RSI calculator

param(
    [switch]$Release,
    [switch]$Watch
)

Write-Host "🦀 Building and Running Rust RSI Calculator" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check if Rust is installed
if (!(Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Rust/Cargo not found. Please install Rust from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# Navigate to the Rust project directory
$rustDir = "rsi-calculator"
if (!(Test-Path $rustDir)) {
    Write-Host "❌ Error: $rustDir directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $rustDir

try {
    Write-Host "📦 Building Rust project..." -ForegroundColor Yellow
    
    if ($Release) {
        Write-Host "🚀 Building in release mode..." -ForegroundColor Green
        cargo build --release
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful! Running release binary..." -ForegroundColor Green
            .\target\release\rsi-calculator.exe
        }
    } elseif ($Watch) {
        Write-Host "👀 Running in watch mode (install cargo-watch if needed)..." -ForegroundColor Green
        if (!(Get-Command cargo-watch -ErrorAction SilentlyContinue)) {
            Write-Host "Installing cargo-watch..." -ForegroundColor Yellow
            cargo install cargo-watch
        }
        cargo watch -x run
    } else {
        Write-Host "🔨 Building in debug mode..." -ForegroundColor Green
        cargo build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful! Running debug binary..." -ForegroundColor Green
            .\target\debug\rsi-calculator.exe
        }
    }
} catch {
    Write-Host "❌ Error occurred: $_" -ForegroundColor Red
} finally {
    Set-Location ..
}

Write-Host ""
Write-Host "💡 Usage tips:" -ForegroundColor Yellow
Write-Host "  .\scripts\run-rust.ps1          # Run in debug mode" -ForegroundColor Gray
Write-Host "  .\scripts\run-rust.ps1 -Release # Run optimized release build" -ForegroundColor Gray
Write-Host "  .\scripts\run-rust.ps1 -Watch   # Run with auto-reload on changes" -ForegroundColor Gray