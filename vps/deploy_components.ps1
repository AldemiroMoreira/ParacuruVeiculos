$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING COMPONENTS..." -ForegroundColor Cyan

# Upload
Write-Host "--- UPLOADING AdBanner.js ---"
scp "public/js/components/AdBanner.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/public/js/components/"

Write-Host ">>> DONE."
# No restart strictly needed for components if no build process, but client refresh needed.
