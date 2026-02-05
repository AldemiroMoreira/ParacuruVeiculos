$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> RESTARTING NGINX..." -ForegroundColor Cyan

$RemoteCommand = "systemctl restart nginx; echo '--- STATUS ---'; systemctl status nginx --no-pager; echo '--- PORTS ---'; netstat -tulnp | grep nginx;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
