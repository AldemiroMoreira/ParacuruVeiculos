$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> DEEP DEBUGGING VPS..." -ForegroundColor Cyan

$RemoteCommands = @(
    "echo '--- DATE ---'; date",
    "echo '--- UFW STATUS ---'; ufw status",
    "echo '--- LISTENING PORTS (SS) ---'; ss -tuln",
    "echo '--- PM2 STATUS ---'; pm2 status",
    "echo '--- CURL LOCALHOST:3000 ---'; curl -I http://localhost:3000",
    "echo '--- NGINX ERROR LOG (LAST 20) ---'; tail -n 20 /var/log/nginx/error.log"
) -join "; "

ssh $VPS_USER@$VPS_IP $RemoteCommands
