const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: DataTypes.TEXT, // Using TEXT for long tokens
        allowNull: true
    }
}, {
    tableName: 'system_settings',
    timestamps: true
});

module.exports = SystemSetting;
