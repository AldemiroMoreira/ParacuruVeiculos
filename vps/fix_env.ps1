$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos/backend"

Write-Host ">>> FIXING .ENV FILE..." -ForegroundColor Cyan

# Flattened command to avoid CRLF issues
$RemoteCommand = "cd $APP_DIR; sed -i '/^EMAIL_/d' .env; echo 'EMAIL_HOST=localhost' >> .env; echo 'EMAIL_PORT=1025' >> .env; echo 'EMAIL_USER=' >> .env; echo 'EMAIL_PASS=' >> .env; pm2 restart app; echo '>>> ENV FIXED & APP RESTARTED';"

ssh $VPS_USER@$VPS_IP $RemoteCommand
