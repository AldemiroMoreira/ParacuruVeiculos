$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DOMAIN = "paracuruveiculos.com.br"

Write-Host ">>> Inspecting Nginx Config..." -ForegroundColor Cyan

$RemoteCommand = "cat /etc/nginx/sites-enabled/$DOMAIN"

ssh $VPS_USER@$VPS_IP $RemoteCommand
