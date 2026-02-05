$VPS_IP = "62.72.63.84"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/paracuru-veiculos"
$DEST_USER_HOST = "$VPS_USER@$VPS_IP"

Write-Host ">>> DEPLOYING OAUTH AUTH FLOW..." -ForegroundColor Cyan

# Upload Backend
scp "backend/models/SystemSetting.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/models/"
scp "backend/models/index.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/models/"
scp "backend/controllers/mlAuthController.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/controllers/"
scp "backend/routes/mlRoutes.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/routes/"
scp "backend/server.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/"
scp "backend/services/affiliateService.js" "${DEST_USER_HOST}:$REMOTE_DIR/backend/services/"

# Upload Frontend
scp "public/js/app.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/"
scp "public/js/pages/MLAuthPage.js" "${DEST_USER_HOST}:$REMOTE_DIR/public/js/pages/"

# Create table via Node if not exists (Sequelize Sync will handle it on restart)
# But we need to make sure SystemSetting is created. 
# The server.js has sequelize.sync({ alter: false }), so it might NOT create new tables unless we use alter:true or manually run migration.
# Let's create `create_settings_table.js` to be safe, or just rely on manual SQL if sync is strictly off.
# Actually, server.js has `alter: false`. So we MUST create the table manually or use a script.

# Upload DB Script (Inline creation)
$DB_SCRIPT = "
const sequelize = require('./backend/config/database');
const SystemSetting = require('./backend/models/SystemSetting');
(async () => {
    await SystemSetting.sync({ force: false });
    console.log('SystemSettings table synced');
    process.exit(0);
})();
"
Set-Content -Path "create_settings_temp.js" -Value $DB_SCRIPT
scp "create_settings_temp.js" "${DEST_USER_HOST}:$REMOTE_DIR/"
ssh $DEST_USER_HOST "cd $REMOTE_DIR && node create_settings_temp.js"
Remove-Item "create_settings_temp.js"

# Restart Backend
ssh $DEST_USER_HOST "pm2 restart app"

Write-Host ">>> OAUTH FLOW DEPLOYED." -ForegroundColor Green
