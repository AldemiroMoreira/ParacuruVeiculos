const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./backend/config/database');

const City = sequelize.define('City', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    nome: { type: DataTypes.STRING },
    uf: { type: DataTypes.STRING }
}, {
    tableName: 'cidades',
    timestamps: false
});

async function findMissing() {
    try {
        // Read JSON IDs
        const jsonPath = path.join(__dirname, 'database/municipios.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const jsonIds = new Set(jsonData.map(c => c.id));
        console.log(`JSON IDs: ${jsonIds.size}`);

        // Read DB IDs
        await sequelize.authenticate();
        const dbCities = await City.findAll({ attributes: ['id'] });
        const dbIds = new Set(dbCities.map(c => c.id));
        console.log(`DB IDs: ${dbIds.size}`);

        // Find diff
        const missing = [...jsonIds].filter(id => !dbIds.has(id));
        console.log('Missing IDs:', missing);

        if (missing.length > 0) {
            const missingData = jsonData.find(c => c.id === missing[0]);
            console.log('Missing City Data:', JSON.stringify(missingData, null, 2));
        }

    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        await sequelize.close();
    }
}
findMissing();
