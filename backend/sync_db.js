const { Usuario } = require('./models');
// const Ad = require('./models/Ad'); // Update all imports if this file is needed

console.log('Synchronizing database...');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        // Alter table to add new columns
        await User.sync({ alter: true });
        console.log('User table synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
})();
