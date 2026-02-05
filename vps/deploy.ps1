# Paracuru Veiculos - Deploy Script (Windows)
# Usage: .\vps\deploy.ps1

$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$APP_DIR = "/var/www/paracuru-veiculos"
$LOCAL_ARCHIVE = "deploy_package.zip"
$ErrorActionPreference = 'Stop' # Stop script if any command fails

Write-Host "---------------------------------------------------"
Write-Host ">>> Starting Deployment to $VPS_IP..." -ForegroundColor Cyan
Write-Host ">>> ATENÇÃO: Você precisará digitar a senha 3 VEZES." -ForegroundColor Red
Write-Host "---------------------------------------------------"


# 1. Clean up old archives
if (Test-Path $LOCAL_ARCHIVE) { Remove-Item $LOCAL_ARCHIVE }

# 2. Compress Project (Excluding node_modules and big files)
Write-Host ">>> Zipping project files..." -ForegroundColor Yellow
$excludes = @("node_modules", ".git", ".env", "deploy_package.zip", "tmp")
Compress-Archive -Path ./* -DestinationPath $LOCAL_ARCHIVE -Update

# 3. Create Remote Directory if not exists
Write-Host ">>> Creating remote dir..."
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${APP_DIR}"

# 4. Upload Archive
Write-Host ">>> Uploading to VPS (Pass your password if asked)..." -ForegroundColor Yellow
scp $LOCAL_ARCHIVE ${VPS_USER}@${VPS_IP}:${APP_DIR}/deploy_package.zip
scp vps/setup.sh ${VPS_USER}@${VPS_IP}:${APP_DIR}/setup.sh

# 5. Extract and Install on Server
Write-Host ">>> Executing Install on VPS..." -ForegroundColor Yellow
$RemoteCommand = @"
    export DEBIAN_FRONTEND=noninteractive
    cd ${APP_DIR}
    
    # Fix line endings for uploaded script
    sed -i 's/\r$//' setup.sh
    chmod +x setup.sh

    echo '>>> Installing unzip if missing...'
    apt-get update && apt-get install -y unzip dos2unix

    echo '>>> Unzipping...'
    unzip -o deploy_package.zip
    rm deploy_package.zip
    
    echo '>>> Running Provisioning Script...'
    ./setup.sh

    echo '>>> Installing Dependencies...'
    npm install --production

    echo '>>> Restarting PM2...'
    pm2 restart app || pm2 start backend/server.js --name app

    echo '>>> Setup Complete!'
"@

# Remove Windows Carriage Returns from the command string to avoid 'command not found' errors
$RemoteCommand = $RemoteCommand -replace "`r", ""

ssh ${VPS_USER}@${VPS_IP} $RemoteCommand

Write-Host ">>> DEPLOYMENT FINISHED!" -ForegroundColor Green
Write-Host ">>> Access your site at http://paracuruveiculos.com.br (after DNS propagation)"
