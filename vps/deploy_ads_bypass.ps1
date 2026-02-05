$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> STEP 1: FETCHING ADS LOCALLY..." -ForegroundColor Cyan
node scripts/fetch_ads_local.js

if (!(Test-Path "ads_dump.json")) {
    Write-Host ">>> ERROR: ads_dump.json not created. Local fetch failed." -ForegroundColor Red
    exit
}

Write-Host ">>> STEP 2: UPLOADING TO VPS..." -ForegroundColor Cyan
# Upload JSON
scp "ads_dump.json" "${DEST_USER_HOST}:$REMOTE_DIR/"
# Upload Import Script
scp "scripts/import_ads.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

Write-Host ">>> STEP 3: IMPORTING INTO DATABASE..." -ForegroundColor Cyan
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/import_ads.js"

Write-Host ">>> SUCCESS! Ads updated manually." -ForegroundColor Green
