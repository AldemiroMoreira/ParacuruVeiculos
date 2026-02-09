$ErrorActionPreference = "Stop"

$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DB = "paracuru_veiculos"
$REMOTE_PASS = "wWd4Jo5q"
$LOCAL_DB = "paracuru_veiculos"
$LOCAL_PORT = 3307
$LOCAL_PASS = "wWd4Jo5q"
$DUMP_FILE = "prod_dump.sql"

# Path to mysqldump/mysql
# We try to find it, or assume it's in PATH or known location
$MYSQL_PATH = "C:\Program Files\MariaDB 11.8\bin\mysql.exe"
if (-not (Test-Path $MYSQL_PATH)) {
    Write-Host "MariaDB mysql.exe not found at default location. Trying to find..."
    $MYSQL_PATH = Get-ChildItem -Path "C:\Program Files", "C:\xampp" -Recurse -Filter "mysql.exe" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName -First 1
}

Write-Host ">>> 1. Dumping Production Database ($REMOTE_DB)..." -ForegroundColor Cyan
ssh -i id_rsa -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mysqldump -u root -p$REMOTE_PASS $REMOTE_DB > /tmp/$DUMP_FILE"

Write-Host ">>> 2. Downloading Dump..." -ForegroundColor Cyan
scp -i id_rsa -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP":/tmp/$DUMP_FILE" .

Write-Host ">>> 3. Creating Local DB ($LOCAL_DB)..." -ForegroundColor Cyan
& $MYSQL_PATH -u root -h 127.0.0.1 -P $LOCAL_PORT -p"$LOCAL_PASS" -e "CREATE DATABASE IF NOT EXISTS $LOCAL_DB;"

Write-Host ">>> 4. Importing Dump to Local ($LOCAL_DB)..." -ForegroundColor Cyan
# Use PowerShell call operator instead of cmd /c to avoid path issues
Get-Content $DUMP_FILE | & $MYSQL_PATH -u root -h 127.0.0.1 -P $LOCAL_PORT -p"$LOCAL_PASS" $LOCAL_DB

Write-Host ">>> 5. Cleanup..." -ForegroundColor Cyan
Remove-Item $DUMP_FILE
ssh -i id_rsa -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "rm /tmp/$DUMP_FILE"

Write-Host ">>> SUCCESS! Loca DB synced with Production." -ForegroundColor Green
