const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('./backend/config/database');

async function check() {
    try {
        // Read JSON
        const jsonPath = path.join(__dirname, 'database/municipios.json');
        const content = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(content);
        console.log('JSON_COUNT:', data.length);

        // Read DB
        await sequelize.authenticate();
        // Use raw query with simple array result
        const [results] = await sequelize.query("SELECT COUNT(*) as c FROM cidades");
        // Results is usually [{ c: 1234 }] or [RowDataPacket { c: 1234 }]
        // We only care about the number
        const count = results[0].c || results[0].count || Object.values(results[0])[0];
        console.log('DB_COUNT:', count);

    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await sequelize.close();
    }
}

check();
