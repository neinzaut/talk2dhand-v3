#!/usr/bin/env powershell

# Development cleanup script for Talk2DHand
# Stops all development services

Write-Host "🛑 Stopping Talk2DHand Development Environment" -ForegroundColor Yellow
Write-Host ""

# Stop backend Docker services
Write-Host "🐳 Stopping backend services..." -ForegroundColor Blue
docker-compose -f docker-compose.dev.yaml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend services stopped successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some issues stopping backend services (they may not have been running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧹 Development environment stopped" -ForegroundColor Green
Write-Host "   The UI development server should be stopped manually with Ctrl+C if still running" -ForegroundColor Gray