$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CHECKING PORTS..." -ForegroundColor Cyan

# Check if netstat exists, install if not (net-tools) or use ss
$RemoteCommand = "
echo '--- NETSTAT ---';
netstat -tulnp | grep :3006 || echo 'Port 3006 NOT FOUND';
echo '--- SS ---';
ss -tulnp | grep :3006 || echo 'Port 3006 NOT FOUND in SS';
echo '--- PM2 LIST ---';
pm2 list;
"

ssh $VPS_USER@$VPS_IP $RemoteCommand
