$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos/backend"

Write-Host ">>> RESTORING SERVICES..." -ForegroundColor Cyan

# Flattened command
# 1. Start backend
# 2. Start Maildev
# 3. Save
$RemoteCommand = "cd $APP_DIR; pm2 start server.js --name app; pm2 start maildev --name maildev -- --smtp 1025 --web 1080 --ip 0.0.0.0; pm2 save; pm2 startup; echo '>>> SERVICES RESTORED'; sleep 2; pm2 list;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
