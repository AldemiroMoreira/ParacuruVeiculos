# Paracuru Veiculos - Remote Database Seed
# Usage: .\vps\seed.ps1

$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos"

Write-Host ">>> Starting Remote Database Seed..." -ForegroundColor Cyan
Write-Host ">>> This will populate Categories, Cities, Models, and Admin User." -ForegroundColor Yellow

ssh $VPS_USER@$VPS_IP "cd $APP_DIR && node backend/seed_prod.js"

Write-Host ">>> SEED COMPLETE!" -ForegroundColor Green
