$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> READING DEBUG LOG..." -ForegroundColor Cyan

# Check size
ssh $DEST_USER_HOST "ls -l /var/www/paracuru-veiculos/debug_log.txt"

# Read content
ssh $DEST_USER_HOST "cat /var/www/paracuru-veiculos/debug_log.txt"

Write-Host ">>> DONE."
