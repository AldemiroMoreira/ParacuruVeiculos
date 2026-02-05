$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CONFIGURING GMAIL SMTP..." -ForegroundColor Cyan

# We remove ALL EMAIL_ keys to ensure EMAIL_HOST/PORT are gone
# This forces emailService.js to fall back to the "service: 'gmail'" block
# Password spaces are stripped: ykuj bugt jdlx fsrg -> ykujbugtjdlxfsrg

$RemoteCommand = "cd /var/www/paracuru-veiculos/backend; cp .env .env.bak_maildev; sed -i '/^EMAIL_/d' .env; echo 'EMAIL_USER=aldemiro.moreira@gmail.com' >> .env; echo 'EMAIL_PASS=ykujbugtjdlxfsrg' >> .env; pm2 restart app; pm2 logs app --lines 20 --nostream"

ssh $VPS_USER@$VPS_IP $RemoteCommand
