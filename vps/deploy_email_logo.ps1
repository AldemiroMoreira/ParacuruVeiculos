$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> UPDATING EMAIL TEMPLATE WITH LOGO..." -ForegroundColor Cyan

# Upload new template helper
scp "backend/utils/emailTemplates.js" $VPS_USER@$VPS_IP":/var/www/paracuru-veiculos/backend/utils/"

# Restart to pick up changes (though technically not needed for utils if not cached at module level in weird ways, but PM2 reload matches better)
ssh $VPS_USER@$VPS_IP "pm2 restart app"
