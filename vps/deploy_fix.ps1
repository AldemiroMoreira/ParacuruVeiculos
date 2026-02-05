$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_BACKEND = "/var/www/paracuru-veiculos/backend"
# Use forward slashes for local path to avoid escaping issues, Powershell handles it fine
$LOCAL_AUTH = "c:/Users/Usuario/Desktop/ParacuruVeiculos/backend/controllers/authController.js"
$LOCAL_FIX = "c:/Users/Usuario/Desktop/ParacuruVeiculos/backend/controllers/fixDataController.js"

$TargetAuth = "$VPS_USER@$VPS_IP`:$REMOTE_BACKEND/controllers/"
$TargetFix = "$VPS_USER@$VPS_IP`:$REMOTE_BACKEND/controllers/"

Write-Host ">>> UPLOADING FIXED CONTROLLERS..." -ForegroundColor Cyan

# 1. AuthController
Write-Host "Uploading authController..."
scp $LOCAL_AUTH $TargetAuth

# 2. FixDataController
Write-Host "Uploading fixDataController..."
scp $LOCAL_FIX $TargetFix

# 3. Restart App
Write-Host "Restarting App..."
ssh $VPS_USER@$VPS_IP "pm2 restart app; echo '>>> CONTROLLERS UPDATED & APP RESTARTED'"
