$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> REBUILDING .ENV CONFIG..." -ForegroundColor Cyan

# Flattened command.
# 1. cd to backend
# 2. Add newline to end of file to prevent append issues (sed -i -e '$a\')
# 3. Remove existing EMAIL_ and MP_ lines
# 4. Append fresh config
# 5. Restart

$RemoteCommand = "cd /var/www/paracuru-veiculos/backend; sed -i -e '$a\' .env; sed -i '/^EMAIL_/d' .env; sed -i '/^MP_/d' .env; echo 'EMAIL_HOST=localhost' >> .env; echo 'EMAIL_PORT=1025' >> .env; echo 'EMAIL_USER=' >> .env; echo 'EMAIL_PASS=' >> .env; echo 'MP_ACCESS_TOKEN=APP_USR-7723783566072281-010903-9fdb1b18e9341b50bab4126dedd3bf79-2483148991' >> .env; echo 'MP_PUBLIC_KEY=APP_USR-c67a18b5-552d-485f-b922-289313ac864e' >> .env; echo 'MP_SANDBOX=false' >> .env; pm2 restart app; echo '>>> CONFIG REBUILT & APP RESTARTED'; sleep 2; pm2 list; curl -I http://localhost:3006;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
