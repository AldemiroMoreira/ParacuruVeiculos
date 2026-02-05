$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> FIXING INDEX.HTML..." -ForegroundColor Cyan

# Upload Index
scp "public/index.html" "${DEST_USER_HOST}:$REMOTE_DIR/public/"

Write-Host ">>> INDEX.HTML UPDATED." -ForegroundColor Green
