$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> MANUAL DEBUG START (Running without PM2)..." -ForegroundColor Cyan

# Stop PM2 to free the port
ssh $DEST_USER_HOST "pm2 stop app"

# Run node directly and capture output (timeout after 10s to not hang)
# We expect it to crash or print 'Server running'
Write-Host "--- ATTEMPTING STARTUP ---"
ssh $DEST_USER_HOST "cd /var/www/paracuru-veiculos && node backend/server.js"

Write-Host ">>> MANUAL DEBUG END."
