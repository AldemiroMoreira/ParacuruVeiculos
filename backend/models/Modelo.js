const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Fabricante = require('./Fabricante');

const Modelo = sequelize.define('Modelo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fabricante_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    especie_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Allow null for now during migration
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'modelos',
    timestamps: false
});

// Associations defined in index.js usually, but can be here too.
// Keeping strictly model def here.

module.exports = Modelo;
