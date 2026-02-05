# Paracuru Veiculos - SSL Setup (Let's Encrypt)
# Usage: .\vps\setup_ssl.ps1

$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DOMAIN = "paracuruveiculos.com.br"
$EMAIL = "tcristina.mv@gmail.com"

Write-Host ">>> Starting SSL Configuration for $DOMAIN..." -ForegroundColor Cyan

$RemoteCommand = "certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect"

ssh $VPS_USER@$VPS_IP $RemoteCommand

Write-Host ">>> SSL SETUP FINISHED!" -ForegroundColor Green
Write-Host ">>> Verify at https://$DOMAIN"
