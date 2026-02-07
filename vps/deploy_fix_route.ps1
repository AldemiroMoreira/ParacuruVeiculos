$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING FIX..." -ForegroundColor Cyan

# Upload
Write-Host "--- UPLOADING propagandasRoutes.js ---"
scp "backend/routes/propagandasRoutes.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/backend/routes/"

# Restart
Write-Host "--- RESTARTING APP ---"
ssh $DEST_USER_HOST "pm2 restart app && sleep 2 && pm2 status"

Write-Host ">>> DONE."
