$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> AUDITING MODEL CATEGORIES..." -ForegroundColor Cyan

scp "vps/audit_models.js" $VPS_USER@$VPS_IP":/var/www/paracuru-veiculos/backend/audit_models.js"
ssh $VPS_USER@$VPS_IP "cd /var/www/paracuru-veiculos/backend; node audit_models.js"
