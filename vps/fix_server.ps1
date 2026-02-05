$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> Fixing Server (Firewall & Restart Nginx)..." -ForegroundColor Cyan

$RemoteCommand = "ufw allow 'Nginx Full'; ufw reload; systemctl restart nginx; echo 'Ports listening:'; ss -tuln | grep -E '80|443'"

ssh $VPS_USER@$VPS_IP $RemoteCommand
