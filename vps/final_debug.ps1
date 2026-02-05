$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> FINAL DEBUG..." -ForegroundColor Cyan

$RemoteCommand = "echo '--- NGINX CONFIG TEST ---'; nginx -t; echo '--- NGINX STATUS ---'; systemctl status nginx --no-pager; echo '--- PORTS ---'; ss -tuln; echo '--- FIREWALL ---'; ufw status verbose"

ssh $VPS_USER@$VPS_IP $RemoteCommand
