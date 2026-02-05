$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> READING ERROR LOGS..." -ForegroundColor Cyan

# Only read the log, nothing else, to fit in snapshot
$RemoteCommand = "tail -n 30 /root/.pm2/logs/app-error.log"

ssh $VPS_USER@$VPS_IP $RemoteCommand
