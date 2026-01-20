const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Ad = require('./Ad');

const AdImage = sequelize.define('AdImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    tableName: 'ad_images',
    timestamps: false
});

module.exports = AdImage;
