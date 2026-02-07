$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DOWNLOADING LOG..." -ForegroundColor Cyan

scp "${DEST_USER_HOST}:/var/www/paracuru-veiculos/startup_error.txt" "startup_error_local.txt"

Write-Host ">>> DONE."
