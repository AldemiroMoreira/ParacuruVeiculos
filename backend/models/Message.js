const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat_id: { // Nullable, if we want to group messages by conversation later, for now optional or we generate unique string from user ids
        type: DataTypes.STRING,
        allowNull: true
    },
    remetente_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    destinatario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    anuncio_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imagem: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'mensagens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Message;
