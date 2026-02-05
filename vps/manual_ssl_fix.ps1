$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DOMAIN = "paracuruveiculos.com.br"

Write-Host ">>> CHECKING CERTS & APPLYING SSL CONFIG..." -ForegroundColor Cyan

# Nginx Config Template with SSL
$NginxConfig = "server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://`$host`$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade`;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host`;
        proxy_cache_bypass `$http_upgrade`;
    }
}"

# Command: Check certs -> Write Config -> Restart
$RemoteCommand = "if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo '>>> CERTIFICATES FOUND! APPLYING CONFIG...';
    echo '$NginxConfig' > /etc/nginx/sites-available/$DOMAIN;
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/;
    nginx -t && systemctl restart nginx;
    echo '>>> NGINX RESTARTED WITH SSL!';
else
    echo '>>> ERROR: CERTIFICATES NOT FOUND! CERTBOT FAILED.';
fi"

ssh $VPS_USER@$VPS_IP $RemoteCommand
