$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos/backend"

# Credentials from User
$MP_ACCESS_TOKEN = "APP_USR-7723783566072281-010903-9fdb1b18e9341b50bab4126dedd3bf79-2483148991"
$MP_PUBLIC_KEY = "APP_USR-c67a18b5-552d-485f-b922-289313ac864e"

Write-Host ">>> UPDATING MERCADO PAGO CREDENTIALS..." -ForegroundColor Cyan

# Flattened command to avoid CRLF issues
$RemoteCommand = "cd $APP_DIR; if grep -q 'MP_ACCESS_TOKEN=' .env; then sed -i 's|MP_ACCESS_TOKEN=.*|MP_ACCESS_TOKEN=$MP_ACCESS_TOKEN|' .env; else echo 'MP_ACCESS_TOKEN=$MP_ACCESS_TOKEN' >> .env; fi; if grep -q 'MP_PUBLIC_KEY=' .env; then sed -i 's|MP_PUBLIC_KEY=.*|MP_PUBLIC_KEY=$MP_PUBLIC_KEY|' .env; else echo 'MP_PUBLIC_KEY=$MP_PUBLIC_KEY' >> .env; fi; if grep -q 'MP_SANDBOX=' .env; then sed -i 's|MP_SANDBOX=.*|MP_SANDBOX=false|' .env; else echo 'MP_SANDBOX=false' >> .env; fi; pm2 restart app; echo '>>> CREDENTIALS UPDATED & APP RESTARTED';"

ssh $VPS_USER@$VPS_IP $RemoteCommand
