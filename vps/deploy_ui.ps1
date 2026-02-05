$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_PUBLIC = "/var/www/paracuru-veiculos/public"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> UPLOADING UI CHANGES..." -ForegroundColor Cyan

# Upload CreateAdPage.js
Write-Host "Uploading CreateAdPage.js..."
scp "public/js/pages/CreateAdPage.js" "${DEST_USER_HOST}:$REMOTE_PUBLIC/js/pages/"

# Upload EditAdPage.js
Write-Host "Uploading EditAdPage.js..."
scp "public/js/pages/EditAdPage.js" "${DEST_USER_HOST}:$REMOTE_PUBLIC/js/pages/"

# Upload HomePage.js
Write-Host "Uploading HomePage.js..."
scp "public/js/pages/HomePage.js" "${DEST_USER_HOST}:$REMOTE_PUBLIC/js/pages/"

# Upload CheckoutPage.js
Write-Host "Uploading CheckoutPage.js..."
scp "public/js/pages/CheckoutPage.js" "${DEST_USER_HOST}:$REMOTE_PUBLIC/js/pages/"

# Upload index.html
Write-Host "Uploading index.html..."
scp "public/index.html" "${DEST_USER_HOST}:$REMOTE_PUBLIC/"

Write-Host ">>> DEPLOYMENT DONE." -ForegroundColor Green
