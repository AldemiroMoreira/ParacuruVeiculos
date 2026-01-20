const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnuncioImage = sequelize.define('AnuncioImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    anuncio_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'anuncio_images',
    timestamps: false
});

module.exports = AnuncioImage;
