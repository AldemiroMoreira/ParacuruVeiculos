$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> FORCE INSTALLING MERCADOPAGO 2.11.0..." -ForegroundColor Cyan

# Install specific version and restart
Write-Host "--- INSTALLING ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && npm install mercadopago@2.11.0 && pm2 restart app"

# Check Status
Write-Host "--- PM2 STATUS ---"
ssh $DEST_USER_HOST "pm2 status"

Write-Host ">>> DONE."
