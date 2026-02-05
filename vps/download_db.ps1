$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_PATH = "/var/www/paracuru-veiculos/backend/database.sqlite"
$LOCAL_PATH = "$HOME\Desktop\database_backup_vps.sqlite"

Write-Host ">>> DOWNLOADING DATABASE..." -ForegroundColor Cyan

# Use SCP to verify path first then download
$RemoteCommand = "ls -l $REMOTE_PATH"
ssh $VPS_USER@$VPS_IP $RemoteCommand

if ($?) {
    scp $VPS_USER@$VPS_IP":"$REMOTE_PATH $LOCAL_PATH
    Write-Host ">>> DATABASE DOWNLOADED TO: $LOCAL_PATH" -ForegroundColor Green
    Write-Host ">>> Use 'DB Browser for SQLite' to open it." -ForegroundColor Yellow
} else {
    Write-Host ">>> ERROR: Database file not found at $REMOTE_PATH" -ForegroundColor Red
}
