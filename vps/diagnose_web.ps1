$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> DIAGNOSING WEB SERVER (FIXED)..." -ForegroundColor Cyan

# Flattened command
$RemoteCommand = "echo '--- NGINX STATUS ---'; systemctl status nginx --no-pager; echo '--- PORTS ---'; netstat -tulnp | grep nginx; echo '--- ERROR LOG ---'; tail -n 20 /var/log/nginx/error.log; echo '--- CURL INTERNAL ---'; curl -I http://localhost:80;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
