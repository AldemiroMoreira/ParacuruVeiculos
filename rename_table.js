const sequelize = require('./backend/config/database');

async function renameTable() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        // Disable foreign key checks to avoid issues during rename if necessary
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        try {
            await sequelize.query('ALTER TABLE states RENAME TO estados');
            console.log('Renamed table "states" to "estados".');
        } catch (e) {
            if (e.original && e.original.code === 'ER_NO_SUCH_TABLE') {
                console.log('Table "states" not found. It might have been renamed already.');
            } else if (e.original && e.original.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log('Table "estados" already exists.');
            } else {
                throw e;
            }
        }

        // Update foreign keys that reference this table might be tricky.
        // In MySQL/MariaDB, renaming a table auto-updates the FK constraint references usually.
        // But let's verify.

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    } catch (e) {
        console.error('Error renaming table:', e);
    } finally {
        await sequelize.close();
    }
}

renameTable();
