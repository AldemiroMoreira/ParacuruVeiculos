$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> STARTING EMERGENCY RESCUE (FIXED)..." -ForegroundColor Red

# Using single line to avoid Windows CRLF issues
ssh $DEST_USER_HOST "systemctl restart nginx; cd /var/www/paracuru-veiculos; pm2 restart all; pm2 save; pm2 status"

Write-Host ">>> RESCUE COMPLETED. Try accessing the site now." -ForegroundColor Green
