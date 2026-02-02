const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bonificacao = sequelize.define('Bonificacao', {
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
    },
    payment_id: {
        type: DataTypes.STRING,
        allowNull: true // Can be linked to internal payment ID or external Ref
    },
    tipo: {
        type: DataTypes.STRING,
        defaultValue: 'renovacao_antecipada'
    },
    valor_desconto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    data: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'bonificacoes',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at'
});

module.exports = Bonificacao;
