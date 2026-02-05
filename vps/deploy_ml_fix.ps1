$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING ML FIX..." -ForegroundColor Cyan

# 1. Upload mlAuthController.js
Write-Host "Uploading mlAuthController.js..."
scp "backend/controllers/mlAuthController.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/controllers/"

# 2. Skip env snippet (already done)
# Write-Host "Uploading env snippet..."
# scp "backend/env_ml_snippet" "${DEST_USER_HOST}:$REMOTE_DIR/backend/env_ml_snippet"

# 3. Skip .env update (already done)
# Write-Host "Updating remote .env..."
# ssh $DEST_USER_HOST "grep -q 'ML_APP_ID' $REMOTE_DIR/backend/.env || cat $REMOTE_DIR/backend/env_ml_snippet >> $REMOTE_DIR/backend/.env"
# ssh $DEST_USER_HOST "rm $REMOTE_DIR/backend/env_ml_snippet"

# 4. Restart Backend
Write-Host "Restarting backend..."
ssh $DEST_USER_HOST "pm2 restart app"

Write-Host ">>> DEPLOY COMPLETED." -ForegroundColor Green
