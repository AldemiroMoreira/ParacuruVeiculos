$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DIAGNOSING LOCALHOST..." -ForegroundColor Cyan

# Check if backend is listening on 3006
ssh $DEST_USER_HOST "netstat -tuln | grep 3006"

# Curl locally
ssh $DEST_USER_HOST "curl -v http://localhost:3006/api/ml/auth-url"

Write-Host ">>> DIAGNOSIS COMPLETE."
