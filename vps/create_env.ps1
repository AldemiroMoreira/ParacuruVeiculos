# Paracuru Veiculos - Create .env on VPS
# Usage: .\vps\create_env.ps1

$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos"
$DOMAIN = "paracuruveiculos.com.br"

Write-Host ">>> Configuring Environment Variables on VPS..." -ForegroundColor Cyan

# 1. Read the DB Password generated during setup
Write-Host ">>> Reading DB Password..."
$DB_PASS = ssh $VPS_USER@$VPS_IP "cat /root/db_password.txt"
# Extract just the value (remove 'DB_PASS=' if present, though setup.sh wrote 'DB_PASS=...')
# setup.sh wrote: echo "DB_PASS=$DB_PASS" > /root/db_password.txt
$DB_PASS = $DB_PASS -replace "DB_PASS=", ""
$DB_PASS = $DB_PASS.Trim()

Write-Host ">>> Got Password: $DB_PASS" -ForegroundColor DarkGray

# 2. Create .env content
$EnvContent = @"
PORT=3000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_USER=paracuru_user
DB_PASS=$DB_PASS
DB_NAME=paracuru_veiculos
DB_PORT=3306
JWT_SECRET=production_secret_key_change_this
Using_VPS_IP=$VPS_IP
"@

# 3. Write to .env on Server
Write-Host ">>> Writing .env file..."
$RemoteCommand = @"
    cat > ${APP_DIR}/backend/.env <<EOF
$EnvContent
EOF
    # Restart PM2 to pick up new env
    pm2 restart app
"@

ssh $VPS_USER@$VPS_IP $RemoteCommand

Write-Host ">>> ENVIRONMENT CONFIGURED!" -ForegroundColor Green
Write-Host ">>> Now try running the seed script again."
