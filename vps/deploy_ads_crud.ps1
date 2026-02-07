$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING ADS CRUD (Admin + Backend)..." -ForegroundColor Cyan

# 1. Upload package.json (Ensure multer)
Write-Host "Uploading package.json..."
scp "package.json" "${DEST_USER_HOST}:$REMOTE_DIR/"

# 2. Upload Backend Files
Write-Host "Uploading propagandasController.js..."
scp "backend/controllers/propagandasController.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/controllers/"

Write-Host "Uploading propagandasRoutes.js..."
scp "backend/routes/propagandasRoutes.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/routes/"

# 3. Upload Frontend AdminPage
Write-Host "Uploading AdminPage.js..."
scp "public/js/pages/AdminPage.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/pages/"

# 4. Install Dependencies & Restart
Write-Host "Running npm install & restart on VPS..." -ForegroundColor Yellow
ssh $DEST_USER_HOST "cd $REMOTE_DIR && npm install --omit=dev && pm2 restart app"

Write-Host ">>> DEPLOYMENT SUCCESS." -ForegroundColor Green
