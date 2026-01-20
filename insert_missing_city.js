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

async function insertMissingCity() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // Boa Esperança do Norte / MT
        // ID: 5101837
        const city = await City.create({
            id: 5101837,
            nome: 'Boa Esperança do Norte',
            uf: 'MT'
        });

        console.log('Inserted city:', city.toJSON());

    } catch (e) {
        console.error('Error inserting city:', e.message);
    } finally {
        await sequelize.close();
    }
}

insertMissingCity();
