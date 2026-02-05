# Paracuru Veiculos - Update Seeder and Retry
# Usage: .\vps\update_seed.ps1

$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos"

Write-Host ">>> Updating seeder.js on VPS..." -ForegroundColor Cyan

# Upload the modified seeder file
scp backend/services/seeder.js ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/services/seeder.js

Write-Host ">>> Re-running Seed Script..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cd $APP_DIR && node backend/seed_prod.js"

Write-Host ">>> SEED UPDATE COMPLETE!" -ForegroundColor Green
