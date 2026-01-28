const sequelize = require('./config/database');

async function addTermsColumn() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const queryInterface = sequelize.getQueryInterface();

        try {
            await queryInterface.addColumn('usuarios', 'termsAcceptedAt', {
                type: 'DATETIME',
                allowNull: true
            });
            console.log('Added termsAcceptedAt column');
        } catch (e) {
            console.log('termsAcceptedAt column might already exist:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

addTermsColumn();
