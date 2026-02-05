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
