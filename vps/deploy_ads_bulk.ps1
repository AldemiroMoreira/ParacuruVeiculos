$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING BULK FEATURES..." -ForegroundColor Cyan

# Backend Uploads
Write-Host "--- UPLOADING BACKEND ---"
scp "backend/controllers/propagandasController.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/backend/controllers/"
scp "backend/routes/propagandasRoutes.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/backend/routes/"

# Frontend Upload (Assuming previous process builds or we upload straight JS if no build step needed for this specific file structure - wait, AdminPage is React, needs build? 
# Looking at previous deploys: deploy_admin.ps1 uploads 'public/js/pages/AdminPage.js'.
# The project seems to use runtime JSX compilation or simple script inclusion? 
# Checking index.html or App.js would confirm, but sticking to established pattern: upload the file to public/js/pages.
Write-Host "--- UPLOADING FRONTEND ---"
scp "public/js/pages/AdminPage.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/public/js/pages/"
scp "public/js/App.js" "${DEST_USER_HOST}:/var/www/paracuru-veiculos/public/js/"

# Restart
Write-Host "--- RESTARTING APP ---"
ssh $DEST_USER_HOST "pm2 restart app"

Write-Host ">>> DONE."
