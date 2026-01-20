const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Propaganda = sequelize.define('Propaganda', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagem_url: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    link_destino: {
        type: DataTypes.STRING(500),
        allowNull: false
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
});

module.exports = Propaganda;
