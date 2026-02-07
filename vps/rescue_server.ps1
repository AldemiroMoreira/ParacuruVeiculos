$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> RESCUING SERVER..." -ForegroundColor Cyan

# Kill everything and restart
Write-Host "--- KILLING ZOMBIES & RESTARTING ---"
ssh $DEST_USER_HOST "pm2 stop all && pm2 delete all && fuser -k 3006/tcp || true && cd /var/www/paracuru-veiculos && pm2 start backend/server.js --name app && systemctl restart nginx"

# Verify
Write-Host "--- VERIFYING ---"
ssh $DEST_USER_HOST "sleep 5 && netstat -tulnp | grep 3006"

Write-Host ">>> RESCUE COMPLETE."
