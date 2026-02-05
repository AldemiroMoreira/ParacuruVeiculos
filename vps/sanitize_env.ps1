$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos/backend"

Write-Host ">>> SANITIZING .ENV & RESTARTING..." -ForegroundColor Cyan

# Flattened command:
# 1. cd to dir
# 2. sed remove \r (CR)
# 3. restart
$RemoteCommand = "cd $APP_DIR; sed -i 's/\r//g' .env; pm2 restart app; echo '>>> SANITIZED & RESTARTED'; sleep 2; pm2 list; curl -I http://localhost:3006;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
