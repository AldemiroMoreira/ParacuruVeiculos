const bcrypt = require('bcryptjs');
const { Usuario } = require('./models');
const sequelize = require('./config/database');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        const email = 'aldemiro.moreira@gmail.com';
        const password = 'admin'; // Temporary password for testing
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user, created] = await Usuario.findOrCreate({
            where: { email },
            defaults: {
                nome: 'Aldemiro',
                password_hash: hashedPassword,
                telefone: '00000000000'
            }
        });

        if (created) {
            console.log('User Aldemiro created.');
        } else {
            console.log('User Aldemiro already exists. Updating password...');
            user.password_hash = hashedPassword;
            await user.save();
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createAdmin();
