$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> RUNNING MANUAL DIAGNOSIS..." -ForegroundColor Cyan

# Upload Script
scp "scripts/manual_run_affiliate.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

# Run Script
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/manual_run_affiliate.js"
