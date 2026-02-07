$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEEP DEBUGGING..." -ForegroundColor Cyan

# 1. Check if App is running and what port
Write-Host "--- NETSTAT (Listening Ports) ---"
ssh $DEST_USER_HOST "netstat -tulnp | grep node"

# 2. Check PM2 status
Write-Host "--- PM2 STATUS ---"
ssh $DEST_USER_HOST "pm2 status"

# 3. Check App Logs (Latest 100 lines) - Look for crashes
Write-Host "--- PM2 ERROR LOGS ---"
ssh $DEST_USER_HOST "pm2 logs app --err --lines 50 --nostream"

# 4. Check Nginx Error Logs
Write-Host "--- NGINX ERROR LOGS ---"
ssh $DEST_USER_HOST "tail -n 20 /var/log/nginx/error.log"

Write-Host ">>> DEBUG FINISHED."
