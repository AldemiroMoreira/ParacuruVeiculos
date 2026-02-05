$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> FINDING LOGS..." -ForegroundColor Cyan

# Flattened command using pm2 show to get paths
# Using grep/awk to extract paths
$RemoteCommand = "pm2 show app | grep 'log path'; echo '--- TAILING RAW LOGS ---'; tail -n 20 /root/.pm2/logs/app-out.log; tail -n 20 /root/.pm2/logs/app-error.log;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
