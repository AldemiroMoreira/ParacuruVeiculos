const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Propaganda = sequelize.define('Propaganda', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagem_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link_destino: {
        type: DataTypes.STRING,
        allowNull: false
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    localizacao: {
        type: DataTypes.ENUM('home_top', 'home_middle', 'sidebar', 'footer'),
        defaultValue: 'home_middle'
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'propagandas',
    timestamps: true
    // updatedAt / createdAt managed by sequelize
});

module.exports = Propaganda;
