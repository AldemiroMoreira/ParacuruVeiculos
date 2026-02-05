$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> CHECKING NGINX CONFIG..." -ForegroundColor Cyan

ssh $DEST_USER_HOST "cat /etc/nginx/sites-enabled/default"

Write-Host ">>> CHECK COMPLETE."
