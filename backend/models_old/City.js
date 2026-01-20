const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const State = require('./State');

const City = sequelize.define('City', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'cities',
    timestamps: false
});

module.exports = City;
