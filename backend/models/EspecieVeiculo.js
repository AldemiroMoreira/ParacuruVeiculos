const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EspecieVeiculo = sequelize.define('EspecieVeiculo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'especie_veiculos',
    timestamps: false
});

module.exports = EspecieVeiculo;
