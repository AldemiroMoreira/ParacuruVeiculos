$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> UPDATING AFFILIATE SERVICE..." -ForegroundColor Cyan

# Upload Service
scp "backend/services/affiliateService.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/services/"

# Restart Backend
ssh $DEST_USER_HOST "pm2 restart app"

Write-Host ">>> SERVICE UPDATED." -ForegroundColor Green
