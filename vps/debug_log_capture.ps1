$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CAPTURING FULL LOGS..." -ForegroundColor Cyan

# Stop PM2
ssh $DEST_USER_HOST "pm2 stop app"

# Run node and capture all output to file, then kill it after 5 seconds
# We use timeout or just let it crash. If it crashes, it exits immediately.
Write-Host "--- RUNNING NODE & CAPTURING ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && node backend/server.js > debug_log.txt 2>&1 || true"

# Read the file
Write-Host "--- LOG CONTENTS ---"
ssh $DEST_USER_HOST "cat /var/www/paracuru-veiculos/debug_log.txt"

Write-Host ">>> COMPLETED."
