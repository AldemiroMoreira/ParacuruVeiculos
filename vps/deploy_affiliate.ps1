$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING AFFILIATE & CLEANUP..." -ForegroundColor Cyan

# Upload Controllers
Write-Host "Uploading anunciosController.js..."
scp "backend/controllers/anunciosController.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/controllers/"
Write-Host "Uploading propagandasController.js..."
scp "backend/controllers/propagandasController.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/controllers/"

# Upload Model & Routes
Write-Host "Uploading Propaganda.js..."
scp "backend/models/Propaganda.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/models/"
Write-Host "Uploading propagandasRoutes.js..."
scp "backend/routes/propagandasRoutes.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/routes/"

# Restart Backend
Write-Host "Restarting Backend..."
ssh $DEST_USER_HOST "pm2 restart app"

Write-Host ">>> DEPLOYMENT DONE." -ForegroundColor Green
