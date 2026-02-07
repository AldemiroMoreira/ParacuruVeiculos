$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DIAGNOSING CONNECTIVITY..." -ForegroundColor Cyan

# 1. Check all listening ports
Write-Host "--- NETSTAT (All Ports) ---"
ssh $DEST_USER_HOST "netstat -tulnp"

# 2. Try to hit the app locally
Write-Host "--- CURL LOCALHOST:3006 ---"
ssh $DEST_USER_HOST "curl -v http://localhost:3006"

# 3. Try to hit Nginx locally
Write-Host "--- CURL LOCALHOST:80 ---"
ssh $DEST_USER_HOST "curl -I http://localhost"

# 4. Check Nginx Error Log tail again
Write-Host "--- NGINX ERROR LOG ---"
ssh $DEST_USER_HOST "tail -n 10 /var/log/nginx/error.log"

Write-Host ">>> DIAGNOSIS COMPLETE."
