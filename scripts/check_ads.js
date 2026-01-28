const { Sequelize } = require('sequelize');
const config = require('../backend/config/database');
const { Usuario, Anuncio } = require('../backend/models');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function checkIds() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const users = await Usuario.findAll({ include: [{ model: Anuncio }] });

        console.log('\n--- USERS & AD COUNTS ---');
        users.forEach(u => {
            console.log(`[ID: ${u.id}] ${u.nome} (${u.email}) - Ads: ${u.Anuncios.length}`);
        });

        const ads = await Anuncio.findAll();
        console.log('\n--- ALL ADS ---');
        ads.forEach(a => {
            console.log(`[ID: ${a.id}] ${a.titulo} -> Owner ID: ${a.usuario_id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkIds();
