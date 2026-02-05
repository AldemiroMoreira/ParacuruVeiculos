$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING REAL ADS..." -ForegroundColor Cyan

if (!(Test-Path "real_ads.json")) {
    Write-Host ">>> ERROR: real_ads.json not found! Run the scrape script first." -ForegroundColor Red
    exit
}

# Upload JSON
scp "real_ads.json" "${DEST_USER_HOST}:$REMOTE_DIR/ads_dump.json" 
# (Reusing name ads_dump.json so we can reuse the import_ads.js logic or we create a new one, keeping it simple I'll reuse import logic but I need to make sure import_ads.js reads ads_dump.json, yes it does)

# Upload Importer (Just in case)
scp "scripts/import_ads.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

Write-Host ">>> IMPORTING..." -ForegroundColor Cyan
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/import_ads.js"

Write-Host ">>> DONE! Real images should be live." -ForegroundColor Green
