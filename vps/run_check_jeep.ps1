$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$LOCAL_SCRIPT = "vps/check_jeep.js"
$REMOTE_DIR = "/var/www/paracuru-veiculos/backend"
$REMOTE_SCRIPT = "$REMOTE_DIR/check_jeep.js"

Write-Host ">>> CHECKING JEEP DATA..." -ForegroundColor Cyan

scp $LOCAL_SCRIPT $VPS_USER@$VPS_IP":"$REMOTE_SCRIPT
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR; node check_jeep.js"
