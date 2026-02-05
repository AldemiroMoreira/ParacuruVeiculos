$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_BACKEND = "/var/www/paracuru-veiculos/backend"
$REMOTE_DATA = "$REMOTE_BACKEND/data"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CREATING REMOTE DATA DIRECTORY..." -ForegroundColor Cyan
# Using double quotes for string interpolation
ssh $DEST_USER_HOST "mkdir -p $REMOTE_DATA"

Write-Host ">>> UPLOADING SCRIPT..." -ForegroundColor Cyan
scp "vps/populate_locations.js" "${DEST_USER_HOST}:$REMOTE_BACKEND/"

Write-Host ">>> UPLOADING DATA FILES (This may take a moment)..." -ForegroundColor Cyan
scp "database/estados.json" "${DEST_USER_HOST}:$REMOTE_DATA/"
scp "database/municipios.json" "${DEST_USER_HOST}:$REMOTE_DATA/"

Write-Host ">>> RUNNING POPULATION..." -ForegroundColor Cyan
ssh $DEST_USER_HOST "cd $REMOTE_BACKEND && node populate_locations.js"

Write-Host ">>> DONE." -ForegroundColor Green
