$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos/backend"

Write-Host ">>> INSTALLING MAILDEV..." -ForegroundColor Cyan

# 1. Install Maildev Globally
# 2. Add Maildev to PM2
# 3. Update .env to use Maildev
# 4. Restart all

$RemoteCommand = "npm install -g maildev;
pm2 delete maildev || true;
pm2 start maildev --name maildev -- --smtp 1025 --web 1080 --ip 0.0.0.0;
cd $APP_DIR;
if grep -q 'EMAIL_HOST=' .env; then sed -i 's|EMAIL_HOST=.*|EMAIL_HOST=localhost|' .env; else echo 'EMAIL_HOST=localhost' >> .env; fi;
if grep -q 'EMAIL_PORT=' .env; then sed -i 's|EMAIL_PORT=.*|EMAIL_PORT=1025|' .env; else echo 'EMAIL_PORT=1025' >> .env; fi;
if grep -q 'EMAIL_USER=' .env; then sed -i 's|EMAIL_USER=.*|EMAIL_USER=|' .env; else echo 'EMAIL_USER=' >> .env; fi;
if grep -q 'EMAIL_PASS=' .env; then sed -i 's|EMAIL_PASS=.*|EMAIL_PASS=|' .env; else echo 'EMAIL_PASS=' >> .env; fi;
pm2 save;
pm2 restart app;
echo '>>> MAILDEV INSTALLED & APP RESTARTED';"

ssh $VPS_USER@$VPS_IP $RemoteCommand
