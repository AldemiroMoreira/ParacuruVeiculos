$VPS_IP = "62.72.63.84"
$VPS_USER = "root"

Write-Host ">>> CREATING USER ALDEMIRO..." -ForegroundColor Cyan

# Script to insert user
# Ensure password matches what they expect (using a known hash or raw pass if model handles it, but better hash it)
# The default mock hash for '123456' or similar. 
# Better: Use the same hash as the other user if we don't know the password, OR generate a new one.
# User tried '91254413' in the screenshot.
# I will use a simple script that hashes '91254413' and inserts.

$JsContent = "
const { Usuario } = require('./models');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connection: OK');
        
        const email = 'aldemiro.moreira@gmail.com';
        const password = '91254413'; // From screenshot
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [user, created] = await Usuario.findOrCreate({
            where: { email },
            defaults: { 
                nome: 'Aldemiro Moreira', 
                password_hash: hashedPassword,
                isVerified: true,
                isAdmin: true 
            }
        });

        if (created) {
            console.log('USER CREATED SUCCESSFULLY');
        } else {
            console.log('USER ALREADY EXISTS, UPDATING PASSWORD...');
            user.password_hash = hashedPassword;
            user.isVerified = true;
            await user.save();
            console.log('USER UPDATED');
        }

    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
"

$RemoteCommand = "echo `"$JsContent`" > /var/www/paracuru-veiculos/backend/fix_user.js; cd /var/www/paracuru-veiculos/backend; node fix_user.js;"

ssh $VPS_USER@$VPS_IP $RemoteCommand
