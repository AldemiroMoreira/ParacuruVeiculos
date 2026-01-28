const sequelize = require('./config/database');

async function addAdminColumns() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const queryInterface = sequelize.getQueryInterface();

        try {
            await queryInterface.addColumn('usuarios', 'isAdmin', {
                type: 'BOOLEAN',
                defaultValue: false
            });
            console.log('Added isAdmin column');
        } catch (e) { console.log('isAdmin likely exists'); }

        try {
            await queryInterface.addColumn('usuarios', 'isBanned', {
                type: 'BOOLEAN',
                defaultValue: false
            });
            console.log('Added isBanned column');
        } catch (e) { console.log('isBanned likely exists'); }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

addAdminColumns();
