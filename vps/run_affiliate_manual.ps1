$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> RUNNING AFFILIATE UPDATE..." -ForegroundColor Cyan

# Create scripts dir
ssh $DEST_USER_HOST "mkdir -p /var/www/paracuru-veiculos/scripts"

# Upload
Write-Host "--- UPLOADING SCRIPT ---"
scp "scripts/manual_run_affiliate.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/scripts/"

# Run
Write-Host "--- EXECUTING NODE SCRIPT ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && node scripts/manual_run_affiliate.js"

Write-Host ">>> DONE."
