$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CHECKING VPS FILES..." -ForegroundColor Cyan

Write-Host "--- server.js (grep api/ml) ---"
ssh $DEST_USER_HOST "grep 'api/ml' $REMOTE_DIR/backend/server.js"

Write-Host "--- mlRoutes.js (ls -l) ---"
ssh $DEST_USER_HOST "ls -l $REMOTE_DIR/backend/routes/mlRoutes.js"

Write-Host ">>> CHECK COMPLETE."
