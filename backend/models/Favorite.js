const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    anuncio_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'favoritos',
    timestamps: true
});

module.exports = Favorite;
