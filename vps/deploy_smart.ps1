$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$DEST = "$VPS_USER@$VPS_IP"

# Create temp folder
$temp = "temp_deploy"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
New-Item -ItemType Directory -Path $temp | Out-Null

# Structure for backend
New-Item -ItemType Directory -Path "$temp/backend/controllers" -Force | Out-Null
New-Item -ItemType Directory -Path "$temp/backend/routes" -Force | Out-Null
Copy-Item "backend/controllers/propagandasController.js" "$temp/backend/controllers/"
Copy-Item "backend/routes/propagandasRoutes.js" "$temp/backend/routes/"

# Structure for frontend
New-Item -ItemType Directory -Path "$temp/public/js/pages" -Force | Out-Null
New-Item -ItemType Directory -Path "$temp/public/js/components" -Force | Out-Null
Copy-Item "public/js/pages/AdminPage.js" "$temp/public/js/pages/"
Copy-Item "public/js/App.js" "$temp/public/js/"
Copy-Item "public/js/components/AdBanner.js" "$temp/public/js/components/"

# Zip
Compress-Archive -Path "$temp/*" -DestinationPath "deploy_fix.zip" -Force

# Upload
Write-Host ">>> UPLOADING ZIP..."
scp "deploy_fix.zip" "${DEST}:/var/www/paracuru-veiculos/"

# Apply
Write-Host ">>> UNZIPPING AND RESTARTING..."
ssh $DEST "cd /var/www/paracuru-veiculos && unzip -o deploy_fix.zip && rm deploy_fix.zip && pm2 restart app"

# Clean up
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
if (Test-Path "deploy_fix.zip") { Remove-Item "deploy_fix.zip" -Force }

Write-Host ">>> DEPLOYMENT COMPLETE."
