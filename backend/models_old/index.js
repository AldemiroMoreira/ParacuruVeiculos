const sequelize = require('../config/database');
const User = require('./User');
const Ad = require('./Ad');
const Plan = require('./Plan');
const Payment = require('./Payment');
const AdImage = require('./AdImage');
const AdminUser = require('./AdminUser');
const State = require('./State');
const City = require('./City');

// Associations
User.hasMany(Ad, { foreignKey: 'user_id' });
Ad.belongsTo(User, { foreignKey: 'user_id' });

Plan.hasMany(Ad, { foreignKey: 'plan_id' });
Ad.belongsTo(Plan, { foreignKey: 'plan_id' });

Ad.hasMany(Payment, { foreignKey: 'ad_id' });
Payment.belongsTo(Ad, { foreignKey: 'ad_id' });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

Ad.hasMany(AdImage, { foreignKey: 'ad_id', as: 'images' });
AdImage.belongsTo(Ad, { foreignKey: 'ad_id' });

Ad.belongsTo(State, { foreignKey: 'state_id' });
Ad.belongsTo(City, { foreignKey: 'city_id' });

State.hasMany(City, { foreignKey: 'state_id' });
City.belongsTo(State, { foreignKey: 'state_id' });

module.exports = {
    sequelize,
    User,
    Ad,
    Plan,
    Payment,
    AdImage,
    AdImage,
    AdminUser,
    State,
    City
};
