$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos"

Write-Host ">>> STARTING APP ON VPS..." -ForegroundColor Cyan

$RemoteCommand = "cd $APP_DIR; npm install; pm2 delete app 2>/dev/null; pm2 start backend/server.js --name app; pm2 save; pm2 list; sleep 5; curl -I http://localhost:3006"

# Note: server.js uses port 3006 in the code I viewed earlier!! The setup.sh said 3000.
# I need to check server.js content again or trust the view_file I did in Step 6.
# Step 35 showed: const PORT = 3006;
# Step 6 setup.sh configures Nginx proxy_pass http://localhost:3000;
# MISMATCH DETECTED!
# I must update Nginx config or change server port. 
# Changing server port is easier via env var, but server.js hardcodes 3006.
# Actually, I should update Nginx to proxy to 3006.

ssh $VPS_USER@$VPS_IP $RemoteCommand
