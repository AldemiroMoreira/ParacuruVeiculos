const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    external_ref: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    plan_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
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
    tableName: 'pagamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Payment;
