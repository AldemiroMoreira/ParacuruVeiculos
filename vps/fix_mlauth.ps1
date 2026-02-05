$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING MLAUTHPAGE FIX..." -ForegroundColor Cyan

# Upload
scp "public/js/pages/MLAuthPage.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/pages/"

# Check Permissions
ssh $DEST_USER_HOST "ls -l $REMOTE_DIR/public/js/pages/MLAuthPage.js"

Write-Host ">>> DEPLOYED." -ForegroundColor Green
