$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$LOCAL_SCRIPT = "vps/list_users.js"
$REMOTE_DIR = "/var/www/paracuru-veiculos/backend"
$REMOTE_SCRIPT = "$REMOTE_DIR/list_users.js"

Write-Host ">>> LISTING USERS..." -ForegroundColor Cyan

# Upload
scp $LOCAL_SCRIPT $VPS_USER@$VPS_IP":"$REMOTE_SCRIPT

# Run
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR; node list_users.js"
