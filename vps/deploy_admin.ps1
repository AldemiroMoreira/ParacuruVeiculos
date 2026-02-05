$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos/public/js/pages"

Write-Host ">>> Uploading AdminPage.js..." -ForegroundColor Cyan
scp "public/js/pages/AdminPage.js" "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/"

Write-Host ">>> Admin UI Updated." -ForegroundColor Green
