$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING AFFILIATE UPDATE..." -ForegroundColor Cyan

# 1. Upload affiliateService.js
Write-Host "Uploading affiliateService.js..."
scp "backend/services/affiliateService.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/services/"

# 2. Upload manual script
Write-Host "Uploading manual script..."
scp "scripts/manual_run_affiliate.js" "${DEST_USER_HOST}:$REMOTE_DIR/scripts/"

# 3. Create scripts folder if not exists (just in case)
ssh $DEST_USER_HOST "mkdir -p $REMOTE_DIR/scripts"

Write-Host ">>> DEPLOY STAGE 1 COMPLETED." -ForegroundColor Green
Write-Host "Now running the script remotely..."

# 4. Execute the script remotely
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node scripts/manual_run_affiliate.js"

Write-Host ">>> EXECUTION COMPLETED." -ForegroundColor Green
