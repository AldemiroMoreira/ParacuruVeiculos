$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> FIXING CATEGORIES MASSIVELY..." -ForegroundColor Cyan

scp "vps/fix_categories_all.js" $VPS_USER@$VPS_IP":/var/www/paracuru-veiculos/backend/fix_categories_all.js"
ssh $VPS_USER@$VPS_IP "cd /var/www/paracuru-veiculos/backend; node fix_categories_all.js"
