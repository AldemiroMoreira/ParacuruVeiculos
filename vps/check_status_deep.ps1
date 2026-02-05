$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CHECKING STATUS DEEP..." -ForegroundColor Cyan

# Flattened command
$RemoteCommand = "pm2 list --no-color; echo '--- CURL VERBOSE ---'; curl -v http://127.0.0.1:3006; echo '--- HOSTS ---'; cat /etc/hosts;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
