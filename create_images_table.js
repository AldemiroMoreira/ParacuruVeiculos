const fs = require('fs');
const path = require('path');
const sequelize = require('./backend/config/database');

async function createTable() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const sql = fs.readFileSync(path.join(__dirname, 'database/schema_update_images.sql'), 'utf8');
        await sequelize.query(sql);
        console.log('Executed schema update.');

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
createTable();
