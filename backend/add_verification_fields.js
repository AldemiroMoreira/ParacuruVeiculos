const sequelize = require('./config/database');

async function addVerificationColumns() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const queryInterface = sequelize.getQueryInterface();

        try {
            await queryInterface.addColumn('usuarios', 'isVerified', {
                type: 'BOOLEAN',
                defaultValue: false
            });
            console.log('Added isVerified column');

            // Mark existing users as verified so we don't lock them out
            await sequelize.query('UPDATE usuarios SET isVerified = 1 WHERE isVerified IS NULL OR isVerified = 0');
            console.log('Updated existing users to verified');

        } catch (e) {
            console.log('isVerified column might already exist:', e.message);
        }

        try {
            await queryInterface.addColumn('usuarios', 'activationToken', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
            console.log('Added activationToken column');
        } catch (e) {
            console.log('activationToken column might already exist:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

addVerificationColumns();
