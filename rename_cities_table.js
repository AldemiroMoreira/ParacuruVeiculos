const sequelize = require('./backend/config/database');

async function renameTable() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        // Disable FK checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        try {
            await sequelize.query('ALTER TABLE cities RENAME TO cidades');
            console.log('Renamed table "cities" to "cidades".');
        } catch (e) {
            if (e.original && e.original.code === 'ER_NO_SUCH_TABLE') {
                console.log('Table "cities" not found.');
            } else if (e.original && e.original.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log('Table "cidades" already exists.');
            } else {
                throw e;
            }
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    } catch (e) {
        console.error('Error renaming table:', e);
    } finally {
        await sequelize.close();
    }
}

renameTable();
