$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$LOCAL_SCRIPT = "vps/fix_user.js"
$REMOTE_DIR = "/var/www/paracuru-veiculos/backend"
$REMOTE_SCRIPT = "$REMOTE_DIR/fix_user.js"

Write-Host ">>> DEPLOYING USER FIX..." -ForegroundColor Cyan

# Upload execution
scp $LOCAL_SCRIPT $VPS_USER@$VPS_IP":"$REMOTE_SCRIPT

# Run execution
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR; node fix_user.js"
