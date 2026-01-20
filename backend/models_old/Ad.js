const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Plan = require('./Plan'); // We will create this

const Ad = sequelize.define('Ad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    make: {
        type: DataTypes.STRING(100)
    },
    model: {
        type: DataTypes.STRING(100)
    },
    state: {
        type: DataTypes.STRING(2),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'expired', 'sold'),
        defaultValue: 'pending'
    },
    expires_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'ads'
});

// Associations
// Ad.belongsTo(User, { foreignKey: 'user_id' });
// Ad.belongsTo(Plan, { foreignKey: 'plan_id' });
// Defined in index.js for better circular dependency handling usually, but here is fine.

module.exports = Ad;
