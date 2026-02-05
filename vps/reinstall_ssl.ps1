$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DOMAIN = "paracuruveiculos.com.br"
$EMAIL = "tcristina.mv@gmail.com"

Write-Host ">>> RE-RUNNING SSL SETUP (FORCE)..." -ForegroundColor Cyan

# Using --reinstall to force certbot to update nginx config again
$RemoteCommand = "certbot install --nginx -d $DOMAIN -d www.$DOMAIN --cert-name $DOMAIN --redirect"

ssh $VPS_USER@$VPS_IP $RemoteCommand
