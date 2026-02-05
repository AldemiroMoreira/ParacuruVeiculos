$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CHECKING SERVICE STATUS..." -ForegroundColor Cyan

$RemoteCommand = "
echo '--- PM2 STATUS ---';
pm2 status;
echo '--- NGINX STATUS ---';
systemctl status nginx --no-pager;
echo '--- INTERNAL CURL ---';
curl -I http://localhost:3006/api/health || echo 'Backend Unreachable';
curl -I http://localhost:3000 || echo 'Port 3000 Unreachable';
"

ssh $VPS_USER@$VPS_IP $RemoteCommand
