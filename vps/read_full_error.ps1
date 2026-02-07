$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CHECKING FULL ERROR LOG..." -ForegroundColor Cyan

# Find error log path
ssh $DEST_USER_HOST "ls -l /root/.pm2/logs/"

# Cat the last 100 lines of error log
Write-Host "--- ERROR LOG CONTENT ---"
ssh $DEST_USER_HOST "tail -n 100 /root/.pm2/logs/app-error.log"

Write-Host ">>> DONE."
