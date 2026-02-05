$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> GENERATING SSL CERTS..." -ForegroundColor Cyan

# Stop nginx just in case (though it is failed)
# Run certbot standalone
# Start nginx
# Check status
$RemoteCommand = "systemctl stop nginx; certbot certonly --standalone -d paracuruveiculos.com.br -d www.paracuruveiculos.com.br --non-interactive --agree-tos -m aldemiro.moreira@gmail.com; systemctl start nginx; systemctl status nginx --no-pager;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
