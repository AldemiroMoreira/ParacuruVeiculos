$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING STATIC ADS..." -ForegroundColor Cyan

# Ensure directory exists
ssh $DEST_USER_HOST "mkdir -p $REMOTE_DIR/public/img/ads"

# Upload Images
scp "public/img/ads/ad_tires.png" "${DEST_USER_HOST}:$REMOTE_DIR/public/img/ads/"
scp "public/img/ads/ad_audio.png" "${DEST_USER_HOST}:$REMOTE_DIR/public/img/ads/"
scp "public/img/ads/ad_accessories.png" "${DEST_USER_HOST}:$REMOTE_DIR/public/img/ads/"

# Upload Seed Script
scp "scripts/seed_static_ads.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

# Run Seed
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/seed_static_ads.js"

Write-Host ">>> STATIC ADS LIVE! Refresh the page." -ForegroundColor Green
