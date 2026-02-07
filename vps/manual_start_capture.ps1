$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> MANUAL STARTUP CAPTURE..." -ForegroundColor Cyan

# Stop PM2
ssh $DEST_USER_HOST "pm2 stop app"

# Run node and capture output (stderr included)
# We expect immediate failure, so timeout isn't needed strictly, but good practice.
# We use || true to ensure script doesn't fail if node returns non-zero.
Write-Host "--- RUNNING SERVER ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && node backend/server.js > startup_error.txt 2>&1 || true"

# Read Log
Write-Host "--- LOG CONTENT ---"
ssh $DEST_USER_HOST "cat /var/www/paracuru-veiculos/startup_error.txt"

Write-Host ">>> DONE."
