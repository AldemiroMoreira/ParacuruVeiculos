$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> DEPLOYING EMAIL STYLES & FIXING URL..." -ForegroundColor Cyan

# 1. Upload new template helper
scp "backend/utils/emailTemplates.js" $VPS_USER@$VPS_IP":/var/www/paracuru-veiculos/backend/utils/"

# 2. Upload updated controller
scp "backend/controllers/authController.js" $VPS_USER@$VPS_IP":/var/www/paracuru-veiculos/backend/controllers/"

# 3. Fix BASE_URL in .env and Restart
# We append BASE_URL if not exists, or replace it. simpler to just append for now as it's likely missing.
$RemoteCommand = "cd /var/www/paracuru-veiculos/backend; sed -i '/^BASE_URL/d' .env; echo 'BASE_URL=https://paracuruveiculos.com.br' >> .env; pm2 restart app; pm2 logs app --lines 20 --nostream"

ssh $VPS_USER@$VPS_IP $RemoteCommand
