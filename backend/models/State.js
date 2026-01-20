const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Note: Schema says 'estado_id' references 'states(uf)'.
// If states table PK is 'uf', then ID is string.
// Let's check states table definition again from previous steps or assume user setup.
// Step 281: uf VARCHAR(2) PRIMARY KEY.
// So State model ID is 'uf'.

const State = sequelize.define('State', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    abbreviation: {
        type: DataTypes.STRING(2),
        allowNull: false,
        primaryKey: true,
        field: 'uf' // Maps 'abbreviation' property to DB column 'uf'
    }
}, {
    tableName: 'estados',
    timestamps: false
});

module.exports = State;
