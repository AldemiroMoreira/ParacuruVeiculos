const Usuario = require('./backend/models/Usuario');
const sequelize = require('./backend/config/database');

async function forceAdmin() {
    try {
        await sequelize.authenticate();

        const admins = ['aldemiro.moreira@gmail.com', 'harissonadv@hotmail.com'];

        for (const email of admins) {
            const user = await Usuario.findOne({ where: { email } });
            if (user) {
                console.log(`Found ${user.nome}. Current isAdmin: ${user.isAdmin}`);
                user.isAdmin = true;
                const saved = await user.save();
                console.log(`Updated ${user.nome}. New isAdmin: ${saved.isAdmin}`);
            } else {
                console.log(`User ${email} not found!`);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

forceAdmin();
