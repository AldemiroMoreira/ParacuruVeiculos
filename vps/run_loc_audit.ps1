$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> AUDITING LOCATIONS..." -ForegroundColor Cyan

scp "vps/audit_locations.js" $VPS_USER@$VPS_IP":/var/www/paracuru-veiculos/backend/audit_locations.js"
ssh $VPS_USER@$VPS_IP "cd /var/www/paracuru-veiculos/backend; node audit_locations.js"
