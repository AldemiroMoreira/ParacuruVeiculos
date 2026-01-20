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

async function check() {
    try {
        await sequelize.authenticate();
        const count = await City.count();
        console.log('DB_COUNT:', count);
    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        await sequelize.close();
    }
}
check();
