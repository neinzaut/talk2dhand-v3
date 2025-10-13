#!/usr/bin/env powershell

# Development startup script for Talk2DHand
# Starts backend services in Docker and UI natively

Write-Host "🚀 Starting Talk2DHand Development Environment" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start backend services
Write-Host "🐳 Starting backend services in Docker..." -ForegroundColor Blue
docker-compose -f docker-compose.dev.yaml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend services started successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start backend services" -ForegroundColor Red
    exit 1
}

# Wait a moment for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if UI directory exists and has package.json
if (Test-Path "ui/package.json") {
    Write-Host "📦 Checking UI dependencies..." -ForegroundColor Blue
    
    # Change to UI directory
    Push-Location ui
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing UI dependencies..." -ForegroundColor Blue
        npm install
    }
    
    Write-Host ""
    Write-Host "🎯 Development environment is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Services available at:" -ForegroundColor Cyan
    Write-Host "   • UI (Next.js):              http://localhost:3000" -ForegroundColor White
    Write-Host "   • Static Signs API:          http://localhost:8000" -ForegroundColor White
    Write-Host "   • Dynamic Phrases API:       http://localhost:5008" -ForegroundColor White
    Write-Host ""
    Write-Host "🔥 Starting UI development server..." -ForegroundColor Blue
    Write-Host "   (Press Ctrl+C to stop)" -ForegroundColor Gray
    Write-Host ""
    
    # Start the UI development server
    npm run dev
    
    # Restore location when done
    Pop-Location
} else {
    Write-Host "❌ UI directory or package.json not found" -ForegroundColor Red
    Write-Host "Make sure you're running this from the /app directory" -ForegroundColor Yellow
    exit 1
}