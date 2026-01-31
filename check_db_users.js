const Usuario = require('./backend/models/Usuario');
const sequelize = require('./backend/config/database');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        const users = await Usuario.findAll();
        console.log(`Total users found: ${users.length}`);
        users.forEach(u => console.log(`- ${u.nome} (${u.email}) [Admin: ${u.isAdmin}]`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUsers();
