const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const City = sequelize.define('City', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // Though we insert manually from JSON IDs
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'nome' // Model property 'name' mapped to DB column 'nome'? Let's check seed script. 
        // Seed script: INSERT INTO cities (id, nome, uf)
        // So DB column is 'nome'.
        // Model usually uses 'name' for standard. Let's alias it or change prop.
        // Let's change prop to 'nome' to be consistent with DB.
    },
    uf: {
        type: DataTypes.STRING(2),
        allowNull: false,
        field: 'uf'   // This is the actual column in DB
    }
}, {
    tableName: 'cidades',
    timestamps: false
});

module.exports = City;
