$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> DEBUGGING CERTBOT..." -ForegroundColor Cyan

$RemoteCommand = "systemctl stop nginx; certbot certonly --standalone -d paracuruveiculos.com.br -d www.paracuruveiculos.com.br --non-interactive --agree-tos -m aldemiro.moreira@gmail.com > /tmp/certbot.log 2>&1; cat /tmp/certbot.log"

ssh $VPS_USER@$VPS_IP $RemoteCommand
