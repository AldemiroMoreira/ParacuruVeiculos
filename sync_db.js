const sequelize = require('./backend/config/database');
const { Payment } = require('./backend/models'); // Load models

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected. Syncing...');
        await sequelize.sync({ alter: true });
        console.log('DB Synced Successfully!');
    } catch (e) {
        console.error('Sync Error:', e);
    } finally {
        await sequelize.close();
    }
}

sync();
