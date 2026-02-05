$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> FIXING APP.JS (REMOVING IMPORT)..." -ForegroundColor Cyan

# Upload App.js (Explicit correct name)
scp "public/js/app.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/App.js"

Write-Host ">>> APP.JS FIXED." -ForegroundColor Green
