$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> TESTING MERCADOPAGO IMPORT..." -ForegroundColor Cyan

# Upload
Write-Host "--- UPLOADING TEST SCRIPT ---"
scp "tests/test_mp.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/"

# Run
Write-Host "--- RUNNING TEST SCRIPT ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && node test_mp.js"

Write-Host ">>> DONE."
