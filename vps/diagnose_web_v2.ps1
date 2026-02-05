$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> DIAGNOSING WEB SERVER V2..." -ForegroundColor Cyan

$RemoteCommand = "echo '--- STATUS ---'; systemctl is-active nginx; echo '--- LISTEN 80 ---'; netstat -tulnp | grep :80; echo '--- LISTEN 443 ---'; netstat -tulnp | grep :443; echo '--- CURL LOCAL 80 ---'; curl -I http://localhost:80;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
