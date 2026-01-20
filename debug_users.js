const User = require('./backend/models/User');
const sequelize = require('./backend/config/database');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const users = await User.findAll();
        console.log('Users found:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
