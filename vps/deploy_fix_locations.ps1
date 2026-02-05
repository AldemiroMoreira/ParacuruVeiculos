$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CORRECTING AD LOCATIONS..." -ForegroundColor Cyan

# 1. Upload fixed HomePage (revert)
scp "public/js/pages/HomePage.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/pages/"

# 2. Upload fixed Service
scp "backend/services/affiliateService.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/services/"

# 3. Upload and Run Migration Script
scp "scripts/move_ads_to_sidebar.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/move_ads_to_sidebar.js"

Write-Host ">>> DONE. Refresh the page!" -ForegroundColor Green
