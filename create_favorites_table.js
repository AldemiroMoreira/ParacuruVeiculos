const sequelize = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

async function createFavoritesTable() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const sql = fs.readFileSync(path.join(__dirname, 'database', 'schema_favorites.sql'), 'utf8');

        // Execute the SQL directly
        await sequelize.query(sql);
        console.log('Favorites table created successfully.');

    } catch (error) {
        console.error('Unable to create table:', error);
    } finally {
        await sequelize.close();
    }
}

createFavoritesTable();
