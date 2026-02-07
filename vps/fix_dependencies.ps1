$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> FIXING DEPENDENCIES..." -ForegroundColor Cyan

# Reinstall MercadoPago
Write-Host "--- REINSTALLING MERCADOPAGO ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && npm uninstall mercadopago && npm install mercadopago && pm2 restart app"

# Check Status
Write-Host "--- PM2 STATUS ---"
ssh $DEST_USER_HOST "pm2 status"

Write-Host ">>> DONE."
