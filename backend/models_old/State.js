const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const State = sequelize.define('State', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    abbreviation: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'states',
    timestamps: false
});

module.exports = State;
