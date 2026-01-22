const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Anuncio = sequelize.define('Anuncio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fabricante_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    modelo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    especie_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Allow null initially for migration/existing data, or forcing? User wants it for new ads. I'll make it allowNull: false eventually but for now maybe true to avoid breaking existing without defaults. But usually we want it required. I will make it allowNull: true for safety on existing rows, but the frontend will require it.
    },
    ano_fabricacao: {
        type: DataTypes.INTEGER
    },
    km: {
        type: DataTypes.INTEGER
    },
    descricao: {
        type: DataTypes.TEXT
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estado_id: {
        // User schema says references states(uf). So it might be string if states PK is UF.
        // OR it might be INT if I managed to create states with IDs.
        // Let's assume it matches State model. If State model PK is UF, this is string.
        // Actually earlier 'migrate_db_v2.js' created states with IDs.
        // schema.sql step 281 says states(uf). 
        // I will trust schema.sql as "User Intent".
        type: DataTypes.STRING(2),
        allowNull: false
    },
    cidade_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending_payment', 'active', 'sold', 'expired'),
        defaultValue: 'pending_payment'
    }
}, {
    tableName: 'anuncios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // Schema uses expires_at managed manually? Or just not auto updated
});

module.exports = Anuncio;
