$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CHECKING LATEST ADS..." -ForegroundColor Cyan

# Upload
Write-Host "--- UPLOADING CHECK SCRIPT ---"
scp "tests/check_today_ads.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/"

# Run it
Write-Host "--- RUNNING CHECK ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && node check_today_ads.js"

# Check logs
Write-Host "--- BOT LOGS ---"
ssh $DEST_USER_HOST "pm2 logs app --lines 200 --nostream | grep 'Affiliate Bot'"

Write-Host ">>> DONE."
