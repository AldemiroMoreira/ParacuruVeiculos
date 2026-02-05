$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CHECKING USER DATA (SIMPLE)..." -ForegroundColor Cyan

# Create a temporary js file on the VPS to avoid quoting issues
$JsContent = "
const { Usuario } = require('./models');
const sequelize = require('./config/database');
(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connection: OK');
        const user = await Usuario.findOne({ where: { email: 'aldemiro.moreira@gmail.com' } });
        if (user) {
            console.log('USER FOUND: ' + user.email + ' (Verified: ' + user.isVerified + ')');
        } else {
            console.log('USER NOT FOUND');
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
"

# Use Here-String for cleaner command
$RemoteCommand = "echo `"$JsContent`" > /var/www/paracuru-veiculos/backend/debug_user_check.js; cd /var/www/paracuru-veiculos/backend; node debug_user_check.js;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
