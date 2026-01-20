const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const AdminUser = sequelize.define('AdminUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'admin_users',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        }
    }
});

AdminUser.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = AdminUser;
