$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING HOMEPAGE..." -ForegroundColor Cyan

# Upload HomePage.js
scp "public/js/pages/HomePage.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/pages/"

Write-Host ">>> HOMEPAGE DEPLOYED." -ForegroundColor Green
