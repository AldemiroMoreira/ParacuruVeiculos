$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> RE-DEPLOYING SERVER.JS..." -ForegroundColor Cyan

# Upload server.js
scp "backend/server.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/server.js"

# Verify content immediately after upload
ssh $DEST_USER_HOST "grep 'api/ml' $REMOTE_DIR/backend/server.js"

# Restart Backend
ssh $DEST_USER_HOST "pm2 restart app"

Write-Host ">>> SERVER.JS REDEPLOYED." -ForegroundColor Green
