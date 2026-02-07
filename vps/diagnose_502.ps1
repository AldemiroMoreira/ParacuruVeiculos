$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DIAGNOSING 502 ERROR..." -ForegroundColor Cyan

# Check PM2 Status
Write-Host "--- PM2 STATUS ---"
ssh $DEST_USER_HOST "pm2 status"

# Check App Logs
Write-Host "--- APP LOGS (Last 50 lines) ---"
ssh $DEST_USER_HOST "pm2 logs app --lines 50 --nostream"

# Check if node_modules exists
Write-Host "--- CHECKING NODE_MODULES ---"
ssh $DEST_USER_HOST "ls -d /var/www/paracuru-veiculos/node_modules"

Write-Host ">>> DIAGNOSIS COMPLETE."
