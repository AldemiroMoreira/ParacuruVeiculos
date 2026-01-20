const sequelize = require('./backend/config/database');
const fs = require('fs');
const path = require('path');

async function createPropagandasTable() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const sql = fs.readFileSync(path.join(__dirname, 'database', 'schema_propagandas.sql'), 'utf8');

        // Execute the SQL
        // Split by semicolon to handle multiple statements (Create + Insert) if driver supports or do manual split
        const statements = sql.split(';').filter(s => s.trim());

        for (let statement of statements) {
            await sequelize.query(statement);
        }

        console.log('Propagandas table created and seeded.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

createPropagandasTable();
