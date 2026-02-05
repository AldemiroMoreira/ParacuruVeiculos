$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> TESTING NGINX CONFIG..." -ForegroundColor Cyan

$RemoteCommand = "echo '--- NGINX -T ---'; nginx -t; echo '--- PORT 80 ---'; netstat -tulnp | grep :80; echo '--- LOGS ---'; tail -n 20 /var/log/nginx/error.log;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
