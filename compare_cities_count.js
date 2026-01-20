const fs = require('fs');
const path = require('path');
const sequelize = require('./backend/config/database');

async function compareCounts() {
    try {
        // Count JSON
        const jsonPath = path.join(__dirname, 'database/municipios.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Total records in municipios.json: ${jsonData.length}`);

        // Count Database
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT COUNT(*) as count FROM cidades;");
        console.log(`Total records in 'cidades' table: ${results[0].count}`);

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

compareCounts();
