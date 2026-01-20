const sequelize = require('./backend/config/database');

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        try {
            const res = await sequelize.query("SHOW TABLES");
            console.log('Tables Raw:', res);
        } catch (e) { console.log(e.message); }

        try {
            const res2 = await sequelize.query("DESCRIBE anuncios");
            console.log('Anuncios Desc:', res2);
        } catch (e) { console.log(e.message); }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkTables();
