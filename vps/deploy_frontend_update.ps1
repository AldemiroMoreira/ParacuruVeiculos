$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING FRONTEND UPDATE..." -ForegroundColor Cyan

# Frontend Upload
Write-Host "--- UPLOADING AdminPage.js ---"
scp "public/js/pages/AdminPage.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/public/js/pages/"

Write-Host ">>> DONE (No restart needed for pure frontend JS if served statically, but restarting just in case/cache clearing)."
ssh $DEST_USER_HOST "pm2 restart app"
