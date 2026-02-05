$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CHECKING INTERNAL PORTS..." -ForegroundColor Cyan

$RemoteCommand = "
echo '--- LOCALHOST:3006 (APP) ---';
curl -I --connect-timeout 2 http://localhost:3006 || echo 'FAIL 3006';
echo '--- LOCALHOST:80 (NGINX) ---';
curl -I --connect-timeout 2 http://localhost:80 || echo 'FAIL 80';
echo '--- UFW STATUS ---';
ufw status verbose;
"

ssh $VPS_USER@$VPS_IP $RemoteCommand
