const sequelize = require('./backend/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("DESCRIBE states;");
        console.log("STATES SCHEMA:", results);
    } catch (e) { console.error(e); }
    process.exit();
}
check();
