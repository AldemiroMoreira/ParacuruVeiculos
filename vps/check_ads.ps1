$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CHECKING PROPAGANDA TABLE..." -ForegroundColor Cyan

# Upload debug script
scp "scripts/debug_propagandas.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

# Run it
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/debug_propagandas.js"

Write-Host ">>> COMPLETED." -ForegroundColor Green
