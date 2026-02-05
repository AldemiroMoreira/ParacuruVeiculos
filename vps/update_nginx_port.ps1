$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> UPDATING NGINX PORT TO 3006..." -ForegroundColor Cyan

# Replace port 3005 with 3006 in the config
ssh $DEST_USER_HOST "sed -i 's/3005/3006/g' /etc/nginx/sites-enabled/paracuruveiculos.com.br"

# Test config
ssh $DEST_USER_HOST "nginx -t"

# Reload Nginx
ssh $DEST_USER_HOST "systemctl reload nginx"

Write-Host ">>> NGINX UPDATED." -ForegroundColor Green
