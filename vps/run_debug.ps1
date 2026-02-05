# Paracuru Veiculos - Debug Seed
# Usage: .\vps\run_debug.ps1

$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos"

Write-Host ">>> Uploading debug script..."
scp backend/debug_seed.js ${VPS_USER}@${VPS_IP}:${APP_DIR}/backend/debug_seed.js

Write-Host ">>> Running Debug Script on VPS..."
ssh $VPS_USER@$VPS_IP "cd $APP_DIR && node backend/debug_seed.js"
