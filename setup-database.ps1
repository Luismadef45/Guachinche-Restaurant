# Database Setup Script for Guachince Restaurant
# This script will:
# 1. Check if Docker is running
# 2. Start Docker Compose services
# 3. Run Prisma migrations
# 4. Seed the database

Write-Host "=== Guachince Restaurant Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envPath = "apps\api\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guachince?schema=public"
"@ | Out-File -FilePath $envPath -Encoding utf8
    Write-Host ".env file created!" -ForegroundColor Green
}

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerStatus = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
    Write-Host "Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker Desktop is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Start Docker Desktop" -ForegroundColor White
    Write-Host "2. Wait for it to fully start" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "If Docker Desktop won't start, you may need to:" -ForegroundColor Yellow
    Write-Host "- Enable WSL2: wsl.exe --install --no-distribution" -ForegroundColor White
    Write-Host "- Enable Virtual Machine Platform in Windows Features" -ForegroundColor White
    Write-Host "- Restart your computer" -ForegroundColor White
    exit 1
}

# Start Docker Compose
Write-Host ""
Write-Host "Starting Docker Compose services..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start Docker Compose services" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if PostgreSQL is ready
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    try {
        $result = docker exec guachince-postgres pg_isready -U postgres 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            Write-Host "PostgreSQL is ready!" -ForegroundColor Green
        }
    } catch {
        # Continue waiting
    }
    
    if (-not $ready) {
        $attempt++
        Start-Sleep -Seconds 1
    }
}

if (-not $ready) {
    Write-Host "WARNING: PostgreSQL may not be ready yet, but continuing..." -ForegroundColor Yellow
}

# Run Prisma migrations
Write-Host ""
Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
Set-Location apps\api
npx prisma migrate dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migration failed" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}

# Run seed script
Write-Host ""
Write-Host "Seeding database with roles and starter location..." -ForegroundColor Yellow
npm run seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Seeding failed" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}

Set-Location ..\..

Write-Host ""
Write-Host "=== Database Setup Complete! ===" -ForegroundColor Green
Write-Host "PostgreSQL is running on localhost:5432" -ForegroundColor Cyan
Write-Host "Redis is running on localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the API server with:" -ForegroundColor Yellow
Write-Host "  cd apps/api && npm run dev" -ForegroundColor White

