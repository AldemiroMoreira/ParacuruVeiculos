$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

$ML_APP_ID = "360959381171797"
$ML_CLIENT_SECRET = "nzeiEUdUFwpxa4QHnd3umWgKb3p35S7g"
$ML_AFFILIATE_ID = "AldemiroMoreira"

Write-Host ">>> CONFIGURING ML CREDENTIALS ON VPS (RETRY)..." -ForegroundColor Cyan

# Run commands sequentially to avoid newline issues

# 1. Update ML_APP_ID
Write-Host "Updating App ID..."
ssh $DEST_USER_HOST "cd $REMOTE_DIR && sed -i '/ML_APP_ID/d' .env && echo 'ML_APP_ID=$ML_APP_ID' >> .env"

# 2. Update ML_CLIENT_SECRET
Write-Host "Updating Client Secret..."
ssh $DEST_USER_HOST "cd $REMOTE_DIR && sed -i '/ML_CLIENT_SECRET/d' .env && echo 'ML_CLIENT_SECRET=$ML_CLIENT_SECRET' >> .env"

# 3. Update ML_AFFILIATE_ID
Write-Host "Updating Affiliate ID..."
ssh $DEST_USER_HOST "cd $REMOTE_DIR && sed -i '/ML_AFFILIATE_ID/d' .env && echo 'ML_AFFILIATE_ID=$ML_AFFILIATE_ID' >> .env"

# 4. Restart App
Write-Host "Restarting Backend..."
ssh $DEST_USER_HOST "pm2 restart app"

Write-Host ">>> API KEYS DEPLOYED & SERVER RESTARTED." -ForegroundColor Green
