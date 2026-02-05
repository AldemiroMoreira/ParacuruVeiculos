$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING MANUAL ADS..." -ForegroundColor Cyan

if (!(Test-Path "ads_dump.json")) {
    Write-Host ">>> ERROR: ads_dump.json not found!" -ForegroundColor Red
    Write-Host "Please save the API result as 'ads_dump.json' in this folder first."
    exit
}

# Upload JSON
scp "ads_dump.json" "${DEST_USER_HOST}:$REMOTE_DIR/"
# Upload updated Importer
scp "scripts/import_ads.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

Write-Host ">>> IMPORTING..." -ForegroundColor Cyan
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/import_ads.js"

Write-Host ">>> DONE! Refresh the site." -ForegroundColor Green
