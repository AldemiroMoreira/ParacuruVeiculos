const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fabricante = sequelize.define('Fabricante', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    logo_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'fabricantes',
    timestamps: false
});

module.exports = Fabricante;
