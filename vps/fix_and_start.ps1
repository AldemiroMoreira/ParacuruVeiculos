$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DOMAIN = "paracuruveiculos.com.br"
$APP_DIR = "/var/www/paracuru-veiculos"

Write-Host ">>> FIXING NGINX PORT & STARTING APP..." -ForegroundColor Cyan

# 1. Update Nginx Config (sed replace 3000 -> 3006)
# 2. Restart Nginx
# 3. Start App on Port 3006
$RemoteCommand = "sed -i 's/localhost:3000/localhost:3006/g' /etc/nginx/sites-enabled/$DOMAIN; sed -i 's/localhost:3000/localhost:3006/g' /etc/nginx/sites-available/$DOMAIN; systemctl restart nginx; cd $APP_DIR; pm2 delete app 2>/dev/null; pm2 start backend/server.js --name app; pm2 save;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
