const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Anuncio = sequelize.define('Anuncio', {
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
    brand: {
        type: DataTypes.STRING
    },
    model: {
        type: DataTypes.STRING
    },
    year: {
        type: DataTypes.INTEGER
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Allow null for migration compatibility, or false if strict
    },
    city_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending_payment', 'active', 'sold', 'expired'),
        defaultValue: 'pending_payment'
    },
    // User ID foreign key is handled by association
}, {
    tableName: 'anuncios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // Schema uses expires_at separately, usually managed manually or via hooks
});

// Associations
User.hasMany(Anuncio, { foreignKey: 'user_id' });
Anuncio.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Anuncio;
