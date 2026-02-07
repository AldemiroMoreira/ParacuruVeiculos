$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CHECKING FOR CRASH..." -ForegroundColor Cyan

# Check PM2 Status (look for restart count)
Write-Host "--- PM2 STATUS ---"
ssh $DEST_USER_HOST "pm2 list"

# Check Logs (Tail 50)
Write-Host "--- APP LOGS ---"
ssh $DEST_USER_HOST "pm2 logs app --lines 50 --nostream"

Write-Host ">>> DONE."
