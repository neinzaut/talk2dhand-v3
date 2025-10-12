# Talk2DHand Docker Management Script
# PowerShell script to manage Docker containers easily

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$AppDir = "app"

function Show-Help {
    Write-Host @"
    
╔══════════════════════════════════════════════════════╗
║    Talk2DHand v3 - Docker Management Script         ║
╚══════════════════════════════════════════════════════╝

USAGE:
    .\docker-manage.ps1 <command>

COMMANDS:
    start       - Start all containers (detached mode)
    stop        - Stop all containers
    restart     - Restart all containers
    build       - Build all containers
    rebuild     - Rebuild all containers (no cache)
    logs        - View logs from all services
    status      - Show running containers
    clean       - Remove all containers and clean up
    ui          - Manage UI service only
    backend     - Manage backend services only
    help        - Show this help message

EXAMPLES:
    .\docker-manage.ps1 start
    .\docker-manage.ps1 logs
    .\docker-manage.ps1 rebuild
    .\docker-manage.ps1 ui

"@ -ForegroundColor Cyan
}

function Start-Services {
    Write-Host "Starting all services..." -ForegroundColor Green
    Set-Location $AppDir
    docker-compose up -d
    Set-Location ..
    Write-Host "`n✅ Services started!" -ForegroundColor Green
    Write-Host "   UI:              http://localhost:3000" -ForegroundColor Yellow
    Write-Host "   Static Signs:    http://localhost:8000" -ForegroundColor Yellow
    Write-Host "   Dynamic Phrases: http://localhost:5008" -ForegroundColor Yellow
}

function Stop-Services {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    Set-Location $AppDir
    docker-compose stop
    Set-Location ..
    Write-Host "✅ Services stopped!" -ForegroundColor Green
}

function Restart-Services {
    Write-Host "Restarting all services..." -ForegroundColor Yellow
    Set-Location $AppDir
    docker-compose restart
    Set-Location ..
    Write-Host "✅ Services restarted!" -ForegroundColor Green
}

function Build-Services {
    Write-Host "Building all containers..." -ForegroundColor Green
    Set-Location $AppDir
    docker-compose build
    Set-Location ..
    Write-Host "✅ Build complete!" -ForegroundColor Green
}

function Rebuild-Services {
    Write-Host "Rebuilding all containers (no cache)..." -ForegroundColor Yellow
    Set-Location $AppDir
    docker-compose build --no-cache
    Set-Location ..
    Write-Host "✅ Rebuild complete!" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "Showing logs (press Ctrl+C to exit)..." -ForegroundColor Cyan
    Set-Location $AppDir
    docker-compose logs -f
    Set-Location ..
}

function Show-Status {
    Write-Host "Container Status:" -ForegroundColor Cyan
    Set-Location $AppDir
    docker-compose ps
    Set-Location ..
    
    Write-Host "`nDocker Resource Usage:" -ForegroundColor Cyan
    docker stats --no-stream
}

function Clean-All {
    Write-Host "⚠️  This will remove all containers, networks, and unused images." -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Host "Cleaning up..." -ForegroundColor Yellow
        Set-Location $AppDir
        docker-compose down -v
        Set-Location ..
        docker system prune -f
        Write-Host "✅ Cleanup complete!" -ForegroundColor Green
    } else {
        Write-Host "❌ Cleanup cancelled." -ForegroundColor Yellow
    }
}

function Manage-UI {
    Write-Host "UI Service Management" -ForegroundColor Cyan
    Write-Host "1. Start UI"
    Write-Host "2. Stop UI"
    Write-Host "3. Restart UI"
    Write-Host "4. Rebuild UI"
    Write-Host "5. View UI logs"
    $choice = Read-Host "Choose option (1-5)"
    
    Set-Location $AppDir
    switch ($choice) {
        "1" { docker-compose up -d ui }
        "2" { docker-compose stop ui }
        "3" { docker-compose restart ui }
        "4" { docker-compose build ui; docker-compose up -d ui }
        "5" { docker-compose logs -f ui }
        default { Write-Host "Invalid option" -ForegroundColor Red }
    }
    Set-Location ..
}

function Manage-Backend {
    Write-Host "Backend Services Management" -ForegroundColor Cyan
    Write-Host "1. Start backends"
    Write-Host "2. Stop backends"
    Write-Host "3. Restart backends"
    Write-Host "4. Rebuild backends"
    Write-Host "5. View backend logs"
    $choice = Read-Host "Choose option (1-5)"
    
    Set-Location $AppDir
    switch ($choice) {
        "1" { docker-compose up -d static-signs dynamic-phrases }
        "2" { docker-compose stop static-signs dynamic-phrases }
        "3" { docker-compose restart static-signs dynamic-phrases }
        "4" { 
            docker-compose build static-signs dynamic-phrases
            docker-compose up -d static-signs dynamic-phrases
        }
        "5" { docker-compose logs -f static-signs dynamic-phrases }
        default { Write-Host "Invalid option" -ForegroundColor Red }
    }
    Set-Location ..
}

# Main command handler
switch ($Command.ToLower()) {
    "start"     { Start-Services }
    "stop"      { Stop-Services }
    "restart"   { Restart-Services }
    "build"     { Build-Services }
    "rebuild"   { Rebuild-Services }
    "logs"      { Show-Logs }
    "status"    { Show-Status }
    "clean"     { Clean-All }
    "ui"        { Manage-UI }
    "backend"   { Manage-Backend }
    "help"      { Show-Help }
    default     { 
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Show-Help 
    }
}

