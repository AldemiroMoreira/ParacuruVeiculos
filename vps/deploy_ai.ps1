$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING BACKEND & AI..." -ForegroundColor Cyan

# 1. Upload package.json (Dependency Updates)
Write-Host "Uploading package.json..."
scp "package.json" "${DEST_USER_HOST}:$REMOTE_DIR/"

# 2. Upload imageValidator.js (Logic)
Write-Host "Uploading imageValidator.js..."
scp "backend/utils/imageValidator.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/utils/"

# 3. Upload anunciosController.js (Logic)
# (Assuming it was already modified in previous steps, but ensuring it's up to date)
Write-Host "Uploading anunciosController.js..."
scp "backend/controllers/anunciosController.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/controllers/"

# 4. Run NPM INSTALL on VPS (Build Binaries)
Write-Host "Running npm install on VPS (This may take a few minutes)..." -ForegroundColor Yellow
ssh $DEST_USER_HOST "cd $REMOTE_DIR && npm install --omit=dev && pm2 restart app"

Write-Host ">>> AI DEPLOYMENT DONE." -ForegroundColor Green
