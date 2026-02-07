$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> ATTEMPTING TO FIX 502 ERROR..." -ForegroundColor Cyan

# Check/Create directory and install dependencies
Write-Host "--- FIXING DIRECTORIES AND DEPENDENCIES ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && mkdir -p public/img/ads && npm install multer && pm2 restart app"

# Check status again
Write-Host "--- CHECKING STATUS ---"
ssh $DEST_USER_HOST "pm2 status"

Write-Host ">>> FIX ATTEMPT COMPLETE."
