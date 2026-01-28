const sequelize = require('./config/database');

async function addExpiresAtColumn() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const queryInterface = sequelize.getQueryInterface();

        await queryInterface.addColumn('anuncios', 'expires_at', {
            type: 'DATETIME',
            allowNull: true
        });

        console.log('Added expires_at column');
    } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addExpiresAtColumn();
