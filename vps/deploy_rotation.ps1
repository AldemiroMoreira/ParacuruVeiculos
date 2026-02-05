$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> STEP 1: UPLOADING BACKEND CHANGES..." -ForegroundColor Cyan
scp "backend/models/Propaganda.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/models/"

# Helper script to sync DB
echo "const sequelize = require('./backend/config/database'); const Propaganda = require('./backend/models/Propaganda'); (async () => { await sequelize.sync({ alter: true }); console.log('DB Synced!'); process.exit(); })();" > temp_sync.js
scp "temp_sync.js" "${DEST_USER_HOST}:$REMOTE_DIR/"
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node temp_sync.js"
rm temp_sync.js

Write-Host ">>> STEP 2: UPLOADING DATA & SCRIPTS..." -ForegroundColor Cyan
if (Test-Path "real_ads.json") {
    scp "real_ads.json" "${DEST_USER_HOST}:$REMOTE_DIR/ads_dump.json"
}
scp "scripts/fetch_real_data.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"
scp "scripts/import_ads.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

Write-Host ">>> STEP 3: RE-IMPORTING DATA..." -ForegroundColor Cyan
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/import_ads.js"

Write-Host ">>> STEP 4: UPLOADING FRONTEND..." -ForegroundColor Cyan
scp "public/js/components/AdBanner.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/components/"

Write-Host ">>> DONE! Rotation and Prices active." -ForegroundColor Green
