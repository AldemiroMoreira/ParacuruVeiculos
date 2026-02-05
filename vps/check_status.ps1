$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> Checking VPS Status (Nginx & Firewall)..." -ForegroundColor Cyan

$RemoteCommand = "echo '--- UFW STATUS ---'; ufw status verbose; echo '--- NGINX STATUS ---'; systemctl status nginx --no-pager; echo '--- PORTS ---'; ss -tuln | grep -E '80|443'"

ssh $VPS_USER@$VPS_IP $RemoteCommand
