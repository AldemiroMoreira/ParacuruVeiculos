$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> DEEP DEBUGGING (FIXED)..." -ForegroundColor Cyan

# Flattened command
$RemoteCommand = "echo '--- ENV CONTENT ---'; cat /var/www/paracuru-veiculos/backend/.env; echo '--- PM2 LOGS ---'; cat /root/.pm2/logs/app-error.log | tail -n 50;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
