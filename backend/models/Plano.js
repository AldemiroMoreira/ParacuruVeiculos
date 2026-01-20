const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plano = sequelize.define('Plano', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duracao_dias: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'planos',
    timestamps: false
});

module.exports = Plano;
