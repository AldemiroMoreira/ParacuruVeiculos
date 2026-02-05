$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> FIXING APP.JS DEPLOYMENT..." -ForegroundColor Cyan

# Remove the accidental lowercase file
ssh $DEST_USER_HOST "rm $REMOTE_DIR/public/js/app.js"

# Upload safely to App.js (Explicit Name)
scp "public/js/app.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/App.js"

Write-Host ">>> APP.JS REDEPLOYED." -ForegroundColor Green
