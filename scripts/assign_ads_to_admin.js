const { Sequelize } = require('sequelize');
const config = require('../backend/config/database');
const { Usuario, Anuncio } = require('../backend/models');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function fixOwners() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Find the admin user
        const adminEmail = 'aldemiro.moreira@gmail.com';
        const user = await Usuario.findOne({ where: { email: adminEmail } });

        if (!user) {
            console.error(`User ${adminEmail} not found!`);
            return;
        }

        console.log(`Found Admin: ${user.nome} (ID: ${user.id})`);

        // 2. Count ads
        const totalAds = await Anuncio.count();
        console.log(`Total Ads in DB: ${totalAds}`);

        // 3. Update ALL ads to this user
        const [updatedRows] = await Anuncio.update(
            { usuario_id: user.id },
            { where: {} } // No condition = update all
        );

        console.log(`\nSUCCESS: Automatically assigned ${updatedRows} ads to ${user.nome}.`);
        console.log('Now they should appear in "Meus Anúncios".');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixOwners();
