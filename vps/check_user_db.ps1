$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CHECKING USER DATA..." -ForegroundColor Cyan

# Check if user exists in DB
# We'll use a simple node script on the VPS to query the DB
$RemoteCommand = "cd /var/www/paracuru-veiculos/backend; node -e 'const { Usuario } = require(\"./models\"); const sequelize = require(\"./config/database\"); (async () => { await sequelize.authenticate(); const user = await Usuario.findOne({ where: { email: \"aldemiro.moreira@gmail.com\" } }); console.log(\"USER FOUND:\", user ? JSON.stringify(user) : \"NULL\"); process.exit(0); })();'"

ssh $VPS_USER@$VPS_IP $RemoteCommand
